<?php
declare(strict_types=1);

namespace Rapport;

/**
 * Members and lead records in one JSON file, guarded by a lock file.
 * Reads share the lock; writes take it exclusively and replace the file atomically,
 * so concurrent requests never lose an update and a crash never leaves half a file.
 */
final class Store
{
    public function __construct(private readonly string $dir)
    {
    }

    public static function fromEnv(): self
    {
        return new self(rtrim((string) Env::get('DATA_DIR', self::defaultDir(dirname(__DIR__))), '/'));
    }

    /**
     * <project>/storage, except inside a Forge zero-downtime release (<site>/releases/<id>),
     * which is replaced on every deploy. There it is <site>/storage: the folder Forge links
     * when "storage" is a shared path, so results survive deploys either way.
     */
    public static function defaultDir(string $root): string
    {
        $real = realpath($root) ?: $root;
        if (basename(dirname($real)) === 'releases') {
            return dirname($real, 2) . '/storage';
        }
        return $root . '/storage';
    }

    public function writable(): bool
    {
        if (!is_dir($this->dir)) {
            @mkdir($this->dir, 0775, true);
        }
        return is_dir($this->dir) && is_writable($this->dir);
    }

    /** Run $fn(array $db) under a shared lock and return its result. */
    public function read(callable $fn): mixed
    {
        return $this->locked(false, $fn);
    }

    /** Run $fn(array &$db) under an exclusive lock, save $db, and return $fn's result. */
    public function write(callable $fn): mixed
    {
        return $this->locked(true, $fn);
    }

    private function file(): string
    {
        return $this->dir . '/rapport.json';
    }

    private function locked(bool $write, callable $fn): mixed
    {
        if (!$this->writable()) {
            throw new \RuntimeException("Data folder {$this->dir} is missing or not writable.");
        }
        $lock = fopen($this->dir . '/rapport.lock', 'c');
        if ($lock === false || !flock($lock, $write ? LOCK_EX : LOCK_SH)) {
            throw new \RuntimeException('Could not lock the data file.');
        }
        try {
            $db = $this->load();
            $result = $fn($db);
            if ($write) {
                $this->save($db);
            }
            return $result;
        } finally {
            flock($lock, LOCK_UN);
            fclose($lock);
        }
    }

    private function load(): array
    {
        $file = $this->file();
        if (!is_file($file)) {
            return ['members' => [], 'records' => []];
        }
        $db = json_decode((string) file_get_contents($file), true);
        if (!is_array($db)) {
            // Refuse to continue rather than overwrite a damaged file.
            throw new \RuntimeException("$file is not valid JSON.");
        }
        return ['members' => $db['members'] ?? [], 'records' => $db['records'] ?? []];
    }

    private function save(array $db): void
    {
        $json = json_encode(
            ['members' => (object) $db['members'], 'records' => (object) $db['records']],
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT
        );
        $tmp = $this->file() . '.' . bin2hex(random_bytes(4)) . '.tmp';
        if ($json === false || file_put_contents($tmp, $json) === false || !rename($tmp, $this->file())) {
            @unlink($tmp);
            throw new \RuntimeException('Could not save the data file.');
        }
    }
}
