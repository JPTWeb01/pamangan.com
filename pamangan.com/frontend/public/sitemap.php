<?php
/** XML sitemap: site pages from seo-data.json plus every recipe from the Recipe API (cached). */
declare(strict_types=1);

const SITEMAP_API = 'https://jptweb01-pamangan-api.hf.space/api/seo/sitemap';
const SITEMAP_TTL = 6 * 3600;

$data = json_decode((string) @file_get_contents(__DIR__ . '/seo-data.json'), true);
$base = rtrim($data['site']['url'] ?? 'https://pamangan.com', '/');
$pages = $data['pages'] ?? ['/' => ['priority' => '1.0', 'changefreq' => 'weekly']];

function x(string $s): string
{
    return htmlspecialchars($s, ENT_XML1 | ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function recipes(): array
{
    $dir = __DIR__ . '/.seo-cache';
    if (!is_dir($dir) && @mkdir($dir, 0750, true)) {
        @file_put_contents("$dir/.htaccess", "Require all denied\nDeny from all\n");
    }
    $file = "$dir/sitemap.json";
    $cached = is_file($file) ? json_decode((string) @file_get_contents($file), true) : null;
    if (is_array($cached) && time() - (int) ($cached['at'] ?? 0) < SITEMAP_TTL) {
        return $cached['items'];
    }
    $body = false;
    $code = 0;
    if (function_exists('curl_init')) {
        $ch = curl_init(SITEMAP_API);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 3,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_USERAGENT => 'pamangan-seo/1.0',
        ]);
        $body = curl_exec($ch);
        $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
    }
    $json = $body !== false && $code === 200 ? json_decode((string) $body, true) : null;
    if (!is_array($json['data'] ?? null)) {
        return is_array($cached) ? $cached['items'] : [];
    }
    if (is_dir($dir)) {
        @file_put_contents($file, json_encode(['at' => time(), 'items' => $json['data']]), LOCK_EX);
    }
    return $json['data'];
}

$today = gmdate('Y-m-d');
$out = '<?xml version="1.0" encoding="UTF-8"?>' . "\n"
    . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">' . "\n";

foreach ($pages as $path => $p) {
    $out .= '<url><loc>' . x($base . $path) . '</loc><lastmod>' . $today . '</lastmod>'
        . '<changefreq>' . x($p['changefreq'] ?? 'weekly') . '</changefreq>'
        . '<priority>' . x($p['priority'] ?? '0.5') . '</priority></url>' . "\n";
}

foreach (recipes() as $r) {
    if (empty($r['path'])) {
        continue;
    }
    $out .= '<url><loc>' . x($base . '/recipe/' . rawurlencode((string) $r['path'])) . '</loc>';
    if (!empty($r['lastmod'])) {
        $out .= '<lastmod>' . x(substr((string) $r['lastmod'], 0, 10)) . '</lastmod>';
    }
    $out .= '<changefreq>monthly</changefreq><priority>0.6</priority>';
    if (!empty($r['image']) && preg_match('#^https://#', (string) $r['image'])) {
        $out .= '<image:image><image:loc>' . x((string) $r['image']) . '</image:loc>'
            . (!empty($r['name']) ? '<image:title>' . x((string) $r['name']) . '</image:title>' : '')
            . '</image:image>';
    }
    $out .= '</url>' . "\n";
}
$out .= '</urlset>' . "\n";

header('Content-Type: application/xml; charset=utf-8');
header('Cache-Control: public, max-age=3600');
header('X-Robots-Tag: noindex');
echo $out;
