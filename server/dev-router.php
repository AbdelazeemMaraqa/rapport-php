<?php
// Local development only:  php -S localhost:8000 -t public server/dev-router.php
// Serves files from public/ and sends /api/* to the API. The lead passcode defaults to "dev".
declare(strict_types=1);

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
if ($path !== '/' && is_file(dirname(__DIR__) . '/public' . $path)) {
    return false; // let the built-in server send the static file
}
if (str_starts_with($path, '/api/')) {
    require __DIR__ . '/bootstrap.php';
    if ((string) \Rapport\Env::get('ADMIN_PASSCODE', '') === '') {
        \Rapport\Env::set('ADMIN_PASSCODE', 'dev');
    }
    \Rapport\Api::handle($_SERVER['REQUEST_METHOD'] ?? 'GET', $path);
    return true;
}
require dirname(__DIR__) . '/public/index.php';
return true;
