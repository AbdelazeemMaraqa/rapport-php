<?php
// Front controller. Nginx sends every path that isn't a real file here (Forge's default site config).
// /api/* goes to the PHP API; "/" serves the app page; anything else is a 404.
declare(strict_types=1);

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';

if (str_starts_with($path, '/api/')) {
    require dirname(__DIR__) . '/server/bootstrap.php';
    \Rapport\Api::handle($_SERVER['REQUEST_METHOD'] ?? 'GET', $path);
    return;
}

if ($path === '/' || $path === '/index.php') {
    header('Content-Type: text/html; charset=utf-8');
    readfile(__DIR__ . '/index.html');
    return;
}

http_response_code(404);
header('Content-Type: text/plain; charset=utf-8');
echo 'Not found';
