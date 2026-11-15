<?php
declare(strict_types=1);

namespace Rapport;

/** The JSON API used by the front end. Same routes and responses as the earlier serverless version. */
final class Api
{
    public static function handle(string $method, string $path): void
    {
        $path = rtrim($path, '/');
        try {
            $store = Store::fromEnv();
            match ($path) {
                '/api/config' => self::config($method, $store),
                '/api/submit' => self::submit($method, $store),
                '/api/withdraw' => self::withdraw($method, $store),
                '/api/admin/members' => self::members($method, $store),
                '/api/admin/records' => self::records($method, $store),
                default => throw new HttpError(404, 'not_found'),
            };
        } catch (HttpError $e) {
            Http::fail($e->status, $e->errorCode, $e->getMessage());
        } catch (\Throwable $e) {
            error_log('[rapport] ' . $e->getMessage());
            Http::fail(500, 'storage_error', 'Storage request failed.');
        }
    }

    private static function only(string $method, string ...$allowed): void
    {
        if (!in_array($method, $allowed, true)) {
            throw new HttpError(405, 'method_not_allowed');
        }
    }

    private static function needStorage(Store $store): void
    {
        if (!$store->writable()) {
            throw new HttpError(503, 'storage_not_configured', 'The data folder is not writable on the server.');
        }
    }

    private static function config(string $method, Store $store): void
    {
        self::only($method, 'GET');
        Http::send(200, [
            'storage' => $store->writable() ? 'file' : 'none',
            'teamCodeRequired' => (string) Env::get('TEAM_CODE', '') !== '',
            'adminConfigured' => (string) Env::get('ADMIN_PASSCODE', '') !== '',
        ]);
    }

    private static function submit(string $method, Store $store): void
    {
        self::only($method, 'POST');
        self::needStorage($store);
        $body = Http::body();
        $teamCode = (string) Env::get('TEAM_CODE', '');
        if ($teamCode !== '') {
            $given = trim((string) ($body['teamCode'] ?? ''));
            if ($given === '') {
                throw new HttpError(403, 'team_code_required', 'A team code is required.');
            }
            if (!Http::safeEqual($given, $teamCode)) {
                throw new HttpError(403, 'bad_team_code', 'Wrong team code.');
            }
        }
        $check = Validate::submission($body);
        if (!$check['ok']) {
            throw new HttpError(400, 'invalid', $check['error']);
        }
        $v = $check['value'];
        $now = Http::now();
        $max = (int) Env::get('MAX_MEMBERS', '200');

        $out = $store->write(function (array &$db) use ($body, $v, $now, $max) {
            if (!empty($body['id'])) {
                $id = (string) $body['id'];
                $existing = $db['members'][$id] ?? null;
                if (!$existing) {
                    throw new HttpError(404, 'not_found', 'These results no longer exist.');
                }
                if (empty($body['token']) || !hash_equals((string) $existing['tokenHash'], hash('sha256', (string) $body['token']))) {
                    throw new HttpError(403, 'bad_token', 'These results belong to another device.');
                }
                // Keep results sent earlier that this submission doesn't repeat; newer ones replace older ones.
                $db['members'][$id] = array_merge($existing, $v, [
                    'results' => array_merge((array) ($existing['results'] ?? []), $v['results']),
                    'completedAt' => array_merge((array) ($existing['completedAt'] ?? []), $v['completedAt']),
                    'updatedAt' => $now,
                ]);
                return [200, ['id' => $id, 'updatedAt' => $now]];
            }
            if (count($db['members']) >= $max) {
                throw new HttpError(409, 'too_many_members', 'The team has reached its member limit.');
            }
            do {
                $id = Http::randomId();
            } while (isset($db['members'][$id]));
            $token = Http::randomToken();
            $db['members'][$id] = ['id' => $id, 'tokenHash' => hash('sha256', $token)] + $v + ['createdAt' => $now, 'updatedAt' => $now];
            return [201, ['id' => $id, 'token' => $token, 'updatedAt' => $now]];
        });
        Http::send($out[0], $out[1]);
    }

    private static function withdraw(string $method, Store $store): void
    {
        self::only($method, 'POST');
        self::needStorage($store);
        $body = Http::body();
        $store->write(function (array &$db) use ($body) {
            $id = (string) ($body['id'] ?? '');
            $existing = $id !== '' ? ($db['members'][$id] ?? null) : null;
            if (!$existing) {
                throw new HttpError(404, 'not_found');
            }
            if (empty($body['token']) || !hash_equals((string) $existing['tokenHash'], hash('sha256', (string) $body['token']))) {
                throw new HttpError(403, 'bad_token');
            }
            unset($db['members'][$id], $db['records'][$id]);
        });
        Http::send(200, ['ok' => true]);
    }

    /** Lead only: list members, or remove one together with the lead's record for them. */
    private static function members(string $method, Store $store): void
    {
        self::only($method, 'GET', 'DELETE');
        self::needStorage($store);
        Http::requireAdmin();
        if ($method === 'GET') {
            $members = $store->read(fn (array $db) => array_values($db['members']));
            $members = array_map(function (array $m) {
                unset($m['tokenHash']);
                foreach (['results', 'completedAt'] as $k) {
                    $m[$k] = (object) ($m[$k] ?? []);
                }
                return $m;
            }, $members);
            usort($members, fn ($a, $b) => strcmp((string) ($b['updatedAt'] ?? ''), (string) ($a['updatedAt'] ?? '')));
            Http::send(200, ['members' => $members]);
            return;
        }
        $id = (string) ($_GET['id'] ?? '');
        if ($id === '') {
            throw new HttpError(400, 'invalid', 'Missing id.');
        }
        $store->write(function (array &$db) use ($id) {
            unset($db['members'][$id], $db['records'][$id]);
        });
        Http::send(200, ['ok' => true]);
    }

    /** Lead only: the lead's record per member (info, development plan, 1:1 notes). */
    private static function records(string $method, Store $store): void
    {
        self::only($method, 'GET', 'PUT');
        self::needStorage($store);
        Http::requireAdmin();
        if ($method === 'GET') {
            $records = $store->read(fn (array $db) => array_intersect_key($db['records'], $db['members']));
            Http::send(200, ['records' => (object) $records]);
            return;
        }
        $body = Http::body(512 * 1024);
        $id = (string) ($body['id'] ?? '');
        $check = Validate::record($body['record'] ?? null);
        if (!$check['ok']) {
            throw new HttpError(400, 'invalid', $check['error']);
        }
        $record = $check['value'] + ['updatedAt' => Http::now()];
        $store->write(function (array &$db) use ($id, $record) {
            if ($id === '' || !isset($db['members'][$id])) {
                throw new HttpError(404, 'not_found', 'No member with this id.');
            }
            $db['records'][$id] = $record;
        });
        Http::send(200, ['ok' => true, 'updatedAt' => $record['updatedAt']]);
    }
}
