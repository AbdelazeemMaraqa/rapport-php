<?php
declare(strict_types=1);

namespace Rapport;

/**
 * Settings come from real environment variables first, then from the .env file in the project root.
 * On Forge, Site → Environment edits that .env file.
 */
final class Env
{
    private static ?array $vars = null;

    public static function get(string $key, ?string $default = null): ?string
    {
        $value = getenv($key);
        if ($value !== false && $value !== '') {
            return $value;
        }
        self::load();
        $value = self::$vars[$key] ?? null;
        return ($value === null || $value === '') ? $default : $value;
    }

    /** For the local dev server and tests. */
    public static function set(string $key, string $value): void
    {
        self::load();
        self::$vars[$key] = $value;
    }

    private static function load(): void
    {
        if (self::$vars !== null) {
            return;
        }
        self::$vars = [];
        $file = dirname(__DIR__) . '/.env';
        if (!is_readable($file)) {
            return;
        }
        foreach (file($file, FILE_IGNORE_NEW_LINES) ?: [] as $line) {
            if (!preg_match('/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*?)\s*$/', $line, $m)) {
                continue;
            }
            $value = $m[2];
            $quoted = strlen($value) >= 2 && ($value[0] === '"' || $value[0] === "'") && $value[-1] === $value[0];
            self::$vars[$m[1]] = $quoted ? substr($value, 1, -1) : preg_replace('/\s+#.*$/', '', $value);
        }
    }
}
