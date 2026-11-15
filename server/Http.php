<?php
declare(strict_types=1);

namespace Rapport;

final class HttpError extends \RuntimeException
{
    public function __construct(public readonly int $status, public readonly string $errorCode, string $message = '')
    {
        parent::__construct($message !== '' ? $message : $errorCode);
    }
}

final class Http
{
    public static function send(int $status, mixed $data): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        header('X-Content-Type-Options: nosniff');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    public static function fail(int $status, string $error, ?string $message = null): void
    {
        self::send($status, ['error' => $error, 'message' => $message ?? $error]);
    }

    /** The JSON request body as an array. */
    public static function body(int $maxBytes = 65536): array
    {
        $raw = file_get_contents('php://input', false, null, 0, $maxBytes + 1);
        $raw = $raw === false ? '' : $raw;
        if (strlen($raw) > $maxBytes) {
            throw new HttpError(413, 'invalid', 'Body too large.');
        }
        if (trim($raw) === '') {
            return [];
        }
        $data = json_decode($raw, true);
        if (!is_array($data)) {
            throw new HttpError(400, 'invalid', 'Body must be valid JSON.');
        }
        return $data;
    }

    public static function safeEqual(string $a, string $b): bool
    {
        return hash_equals(hash('sha256', $a), hash('sha256', $b));
    }

    /** Throws unless the request carries the right x-admin-passcode header. */
    public static function requireAdmin(): void
    {
        $expected = (string) Env::get('ADMIN_PASSCODE', '');
        if ($expected === '') {
            throw new HttpError(503, 'admin_not_configured', 'Set ADMIN_PASSCODE in the site environment.');
        }
        $given = (string) ($_SERVER['HTTP_X_ADMIN_PASSCODE'] ?? '');
        if (!self::safeEqual($given, $expected)) {
            usleep(600000); // slows down guessing
            throw new HttpError(401, 'unauthorized', 'Wrong passcode.');
        }
    }

    /** Ids start with a letter so PHP never treats them as integer array keys. */
    public static function randomId(int $len = 12): string
    {
        $chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        $id = 'm';
        foreach (str_split(random_bytes($len - 1)) as $byte) {
            $id .= $chars[ord($byte) % strlen($chars)];
        }
        return $id;
    }

    public static function randomToken(): string
    {
        return bin2hex(random_bytes(24));
    }

    public static function now(): string
    {
        return (new \DateTimeImmutable('now', new \DateTimeZone('UTC')))->format('Y-m-d\TH:i:s.v\Z');
    }
}
