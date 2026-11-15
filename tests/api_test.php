<?php
// Backend tests: php tests/api_test.php
declare(strict_types=1);

require dirname(__DIR__) . '/server/bootstrap.php';

use Rapport\Store;
use Rapport\Validate;

$failures = 0;
$count = 0;
function check(bool $ok, string $what): void
{
    global $failures, $count;
    $count++;
    if (!$ok) {
        $failures++;
        fwrite(STDERR, "FAIL: $what\n");
    }
}

// ---- Submissions ----
$ok = Validate::submission(['name' => '  Abd  ', 'role' => 'Lead', 'results' => ['disc' => ['D' => 150, 'I' => -5, 'S' => 50.4, 'C' => 0], 'extra' => ['x' => 1]]]);
check($ok['ok'] === true, 'valid submission accepted');
check($ok['value']['results'] === ['disc' => ['D' => 100, 'I' => 0, 'S' => 50, 'C' => 0]], 'scores clamped, unknown tests dropped');
check($ok['value']['name'] === 'Abd', 'name trimmed');
check(Validate::submission(['name' => '', 'results' => ['disc' => ['D' => 1, 'I' => 1, 'S' => 1, 'C' => 1]]])['ok'] === false, 'name required');
check(Validate::submission(['name' => 'x', 'results' => ['type' => ['EI' => 1]]])['ok'] === false, 'missing keys rejected');
check(Validate::submission(['name' => 'x', 'results' => []])['ok'] === false, 'at least one result');
check(Validate::submission(['name' => 'x', 'results' => ['disc' => ['D' => '5', 'I' => 1, 'S' => 1, 'C' => 1]]])['ok'] === false, 'numbers only');
$dated = Validate::submission(['name' => 'x', 'results' => ['disc' => ['D' => 1, 'I' => 2, 'S' => 3, 'C' => 4]], 'completedAt' => ['disc' => '2026-11-15T09:00:00Z', 'big5' => 'nope']]);
check($dated['value']['completedAt'] === ['disc' => '2026-11-15T09:00:00.000Z'], 'completion dates normalised, bad ones dropped');
check(Validate::cleanText("سامي\u{0000}  أحمد\n", 60) === 'سامي أحمد', 'control characters removed from names');
check(mb_strlen(Validate::cleanText(str_repeat('ب', 100), 60)) === 60, 'names capped at 60 characters');

// ---- Lead records ----
$r = Validate::record([
    'info' => ['team' => ' Platform ', 'email' => 'a@b.co', 'startDate' => '2026-02-30', 'junk' => 1],
    'plan' => ['focus' => "Grow\r\n\r\n\r\nfast", 'goals' => [['id' => 'g1', 'text' => 'Lead reviews', 'status' => 'doing', 'due' => '2026-12-01'], ['text' => '', 'measure' => ''], ['text' => 'x', 'status' => 'weird']], 'review' => 'soon'],
    'notes' => [['id' => 'n1', 'date' => '2026-11-01', 'text' => 'ok'], ['text' => '   ']],
]);
check($r['ok'] === true, 'record accepted');
check($r['value']['info']['team'] === 'Platform', 'info trimmed');
check($r['value']['info']['startDate'] === '', 'impossible date dropped');
check(!isset($r['value']['info']['junk']), 'unknown info fields dropped');
check($r['value']['plan']['focus'] === "Grow\n\nfast", 'line breaks kept and collapsed');
check(count($r['value']['plan']['goals']) === 2, 'empty goals dropped');
check($r['value']['plan']['goals'][1]['status'] === 'todo', 'unknown status becomes todo');
check($r['value']['plan']['review'] === '', 'bad review date dropped');
check(count($r['value']['notes']) === 1, 'empty notes dropped');
check(Validate::record(null)['ok'] === false, 'record must be an object');
check(Validate::record(['plan' => ['goals' => array_fill(0, 41, ['text' => 'x'])]])['ok'] === false, 'goal limit');

// ---- Store: concurrent writers never lose an update ----
$dir = sys_get_temp_dir() . '/rapport-test-' . bin2hex(random_bytes(4));
$store = new Store($dir);
check($store->writable(), 'store creates its folder');
$workers = 12;
$perWorker = 15;
$pids = [];
for ($w = 0; $w < $workers; $w++) {
    $pid = pcntl_fork();
    if ($pid === 0) {
        $s = new Store($dir);
        for ($i = 0; $i < $perWorker; $i++) {
            $s->write(function (array &$db) use ($w, $i) {
                $db['members']["m{$w}x{$i}"] = ['id' => "m{$w}x{$i}", 'name' => "سامي $w/$i"];
            });
        }
        exit(0);
    }
    $pids[] = $pid;
}
foreach ($pids as $pid) {
    pcntl_waitpid($pid, $status);
}
$total = $store->read(fn (array $db) => count($db['members']));
check($total === $workers * $perWorker, "concurrent writes kept ($total of " . ($workers * $perWorker) . ')');
$json = json_decode((string) file_get_contents("$dir/rapport.json"), true);
check(is_array($json) && isset($json['members']['m0x0']['name']) && $json['members']['m0x0']['name'] === 'سامي 0/0', 'Arabic stored as readable UTF-8');
check(glob("$dir/*.tmp") === [], 'no temp files left behind');

// A damaged data file is never overwritten.
file_put_contents("$dir/rapport.json", '{broken');
$threw = false;
try {
    $store->write(function (array &$db) {
        $db['members'] = [];
    });
} catch (\RuntimeException) {
    $threw = true;
}
check($threw && file_get_contents("$dir/rapport.json") === '{broken', 'damaged file left untouched');
array_map('unlink', glob("$dir/*"));
rmdir($dir);

// ---- Data folder survives Forge zero-downtime releases ----
$site = sys_get_temp_dir() . '/rapport-site-' . getmypid();
mkdir("$site/releases/20261115120000", 0777, true);
symlink("$site/releases/20261115120000", "$site/current");
check(Store::defaultDir("$site/releases/20261115120000") === "$site/storage", 'release folder → site storage');
check(Store::defaultDir("$site/current") === "$site/storage", 'current symlink → site storage');
check(Store::defaultDir('/home/forge/example.com') === '/home/forge/example.com/storage', 'standard deploy → project storage');
unlink("$site/current");
rmdir("$site/releases/20261115120000");
rmdir("$site/releases");
rmdir($site);

echo $failures ? "$failures of $count checks failed\n" : "All $count backend checks passed\n";
exit($failures ? 1 : 0);
