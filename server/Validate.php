<?php
declare(strict_types=1);

namespace Rapport;

/** Validates and clamps what members and the lead send. Anything not listed here is dropped. */
final class Validate
{
    private const SHAPES = [
        'disc' => ['keys' => ['D', 'I', 'S', 'C'], 'lo' => 0, 'hi' => 100],
        'type' => ['keys' => ['EI', 'SN', 'TF', 'JP'], 'lo' => -100, 'hi' => 100],
        'big5' => ['keys' => ['O', 'C', 'E', 'A', 'ES'], 'lo' => 0, 'hi' => 100],
    ];
    private const STATUSES = ['todo', 'doing', 'done'];

    public static function cleanText(mixed $s, int $max): string
    {
        $s = is_scalar($s) ? (string) $s : '';
        $s = preg_replace('/[\x00-\x1F\x7F]/u', ' ', $s) ?? '';
        $s = trim(preg_replace('/\s+/u', ' ', $s) ?? '');
        return mb_substr($s, 0, $max);
    }

    /** Like cleanText but keeps line breaks (notes and plans). */
    public static function cleanLong(mixed $s, int $max): string
    {
        $s = is_scalar($s) ? (string) $s : '';
        $s = str_replace(["\r\n", "\r"], "\n", $s);
        $s = preg_replace('/[\x00-\x09\x0B-\x1F\x7F]/u', ' ', $s) ?? '';
        $s = trim(preg_replace('/\n{3,}/', "\n\n", $s) ?? '');
        return mb_substr($s, 0, $max);
    }

    public static function isoDate(mixed $v): string
    {
        if (!is_string($v) || $v === '' || strlen($v) > 40) {
            return '';
        }
        try {
            $d = new \DateTimeImmutable($v);
        } catch (\Exception) {
            return '';
        }
        return $d->setTimezone(new \DateTimeZone('UTC'))->format('Y-m-d\TH:i:s.v\Z');
    }

    /** A calendar day typed by the lead: YYYY-MM-DD or empty. */
    public static function day(mixed $v): string
    {
        if (!is_string($v) || !preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $v, $m)) {
            return '';
        }
        return checkdate((int) $m[2], (int) $m[3], (int) $m[1]) ? $v : '';
    }

    private static function isNum(mixed $v): bool
    {
        return (is_int($v) || is_float($v)) && is_finite((float) $v);
    }

    /** @return array{ok: bool, value?: array, error?: string} */
    public static function submission(mixed $body): array
    {
        if (!is_array($body)) {
            return ['ok' => false, 'error' => 'Body must be a JSON object.'];
        }
        $name = self::cleanText($body['name'] ?? '', 60);
        if ($name === '') {
            return ['ok' => false, 'error' => 'Name is required.'];
        }
        $results = [];
        $completedAt = [];
        foreach (self::SHAPES as $test => $shape) {
            $r = $body['results'][$test] ?? null;
            if ($r === null) {
                continue;
            }
            if (!is_array($r)) {
                return ['ok' => false, 'error' => "Results for $test are malformed."];
            }
            $out = [];
            foreach ($shape['keys'] as $k) {
                if (!self::isNum($r[$k] ?? null)) {
                    return ['ok' => false, 'error' => "Results for $test are missing $k."];
                }
                $out[$k] = (int) max($shape['lo'], min($shape['hi'], round((float) $r[$k])));
            }
            $results[$test] = $out;
            $when = self::isoDate($body['completedAt'][$test] ?? null);
            if ($when !== '') {
                $completedAt[$test] = $when;
            }
        }
        if (!$results) {
            return ['ok' => false, 'error' => 'Send at least one result.'];
        }
        return ['ok' => true, 'value' => [
            'name' => $name,
            'role' => self::cleanText($body['role'] ?? '', 60),
            'lang' => ($body['lang'] ?? '') === 'en' ? 'en' : 'ar',
            'results' => $results,
            'completedAt' => $completedAt,
        ]];
    }

    private static function shortId(mixed $v, int $i): string
    {
        $id = preg_replace('/[^a-z0-9_-]/i', '', self::cleanText($v, 24)) ?? '';
        return $id !== '' ? $id : "g$i";
    }

    /** The lead's own record for a member: info, development plan and 1:1 notes. */
    public static function record(mixed $rec): array
    {
        if (!is_array($rec)) {
            return ['ok' => false, 'error' => 'Record must be an object.'];
        }
        $info = is_array($rec['info'] ?? null) ? $rec['info'] : [];
        $plan = is_array($rec['plan'] ?? null) ? $rec['plan'] : [];
        $goals = is_array($plan['goals'] ?? null) ? array_values($plan['goals']) : [];
        $notes = is_array($rec['notes'] ?? null) ? array_values($rec['notes']) : [];
        if (count($goals) > 40) {
            return ['ok' => false, 'error' => 'At most 40 goals.'];
        }
        if (count($notes) > 150) {
            return ['ok' => false, 'error' => 'At most 150 notes.'];
        }
        $cleanGoals = [];
        foreach ($goals as $i => $g) {
            if (!is_array($g)) {
                continue;
            }
            $goal = [
                'id' => self::shortId($g['id'] ?? '', $i),
                'text' => self::cleanLong($g['text'] ?? '', 600),
                'measure' => self::cleanLong($g['measure'] ?? '', 400),
                'due' => self::day($g['due'] ?? ''),
                'status' => in_array($g['status'] ?? '', self::STATUSES, true) ? $g['status'] : 'todo',
            ];
            if ($goal['text'] !== '' || $goal['measure'] !== '') {
                $cleanGoals[] = $goal;
            }
        }
        $cleanNotes = [];
        foreach ($notes as $i => $n) {
            if (!is_array($n)) {
                continue;
            }
            $note = [
                'id' => self::shortId($n['id'] ?? '', $i),
                'date' => self::day($n['date'] ?? '') ?: gmdate('Y-m-d'),
                'text' => self::cleanLong($n['text'] ?? '', 3000),
            ];
            if ($note['text'] !== '') {
                $cleanNotes[] = $note;
            }
        }
        return ['ok' => true, 'value' => [
            'info' => [
                'team' => self::cleanText($info['team'] ?? '', 80),
                'email' => self::cleanText($info['email'] ?? '', 120),
                'phone' => self::cleanText($info['phone'] ?? '', 40),
                'startDate' => self::day($info['startDate'] ?? ''),
                'about' => self::cleanLong($info['about'] ?? '', 2000),
            ],
            'plan' => [
                'focus' => self::cleanLong($plan['focus'] ?? '', 2000),
                'goals' => $cleanGoals,
                'support' => self::cleanLong($plan['support'] ?? '', 2000),
                'review' => self::day($plan['review'] ?? ''),
            ],
            'notes' => $cleanNotes,
        ]];
    }
}
