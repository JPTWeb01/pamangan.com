<?php
/**
 * Serves the React app (index.html) with page-specific SEO for every URL:
 * title, description, canonical, Open Graph / Twitter tags, robots,
 * structured data (JSON-LD) and the correct HTTP status (404 for unknown pages).
 *
 * Page data comes from seo-data.json (generated at build time from
 * src/data/seo-pages.json and src/data/business.js). Recipe pages are looked up
 * on the Recipe API and cached on disk so pages stay fast.
 */
declare(strict_types=1);

const SEO_API = 'https://jptweb01-pamangan-api.hf.space/api';

$html = @file_get_contents(__DIR__ . '/index.html');
if ($html === false) {
    http_response_code(503);
    header('Retry-After: 60');
    exit('Pamangan is updating. Please refresh in a minute.');
}

$data = json_decode((string) @file_get_contents(__DIR__ . '/seo-data.json'), true);
if (!is_array($data) || empty($data['pages'])) {
    // No SEO data: serve the app unchanged rather than failing
    send_html($html, 200);
}

$site = $data['site'];
$base = rtrim($site['url'], '/');
$siteName = $site['name'];

// ── Resolve the requested path ───────────────────────────────────────────────
$uri = $_SERVER['REQUEST_URI'] ?? '/';
$path = rawurldecode((string) (parse_url($uri, PHP_URL_PATH) ?: '/'));
$query = $_GET;
// Direct test access: /seo.php?__seo_path=/menu
if (strpos($uri, '/seo.php') === 0) {
    $path = (string) ($query['__seo_path'] ?? '/');
    unset($query['__seo_path']);
}
$path = '/' . ltrim(preg_replace('#/+#', '/', $path), '/');
if ($path !== '/' && substr($path, -1) === '/') {
    $qs = $query ? '?' . http_build_query($query) : '';
    header('Location: ' . $base . rtrim($path, '/') . $qs, true, 301);
    exit;
}

// ── Build the page meta ──────────────────────────────────────────────────────
$status = 200;
$meta = [
    'title' => $siteName,
    'description' => $data['pages']['/']['description'],
    'canonical' => $base . $path,
    'image' => $site['image'],
    'type' => 'website',
    'robots' => 'index, follow, max-image-preview:large',
];
$ld = [];
$crumbs = [];

$pages = $data['pages'];
if (isset($pages[$path])) {
    $page = $pages[$path];
    $meta['title'] = $page['title'];
    $meta['description'] = $page['description'];
    $meta['canonical'] = $base . ($path === '/' ? '/' : $path);
    $crumbs = crumbs_for($path, $page['title']);

    if ($path === '/recipes') {
        if (!empty($query['q'])) {
            $meta['robots'] = 'noindex, follow';  // search result pages
        } elseif (!empty($query['cuisine']) && is_string($query['cuisine'])) {
            $cuisine = mb_substr(trim($query['cuisine']), 0, 40);
            $meta['title'] = "$cuisine Recipes — Pamangan Recipe Kitchen";
            $meta['description'] = "Browse $cuisine recipes in the Pamangan Recipe Kitchen, with ingredients, step-by-step instructions, nutrition and food history.";
            $meta['canonical'] = $base . '/recipes?cuisine=' . rawurlencode($cuisine);
        }
    }
    if ($path === '/') {
        $ld[] = [
            '@context' => 'https://schema.org',
            '@type' => 'WebSite',
            '@id' => "$base/#website",
            'name' => $siteName,
            'url' => "$base/",
            'publisher' => ['@id' => "$base/#business"],
        ];
    }
    if (($path === '/menu' || $path === '/') && !empty($data['menu'])) {
        $ld[] = menu_schema($data, $base);
    }
    if ($path === '/order' && !empty($data['faq'])) {
        $ld[] = [
            '@context' => 'https://schema.org',
            '@type' => 'FAQPage',
            'mainEntity' => array_map(fn($f) => [
                '@type' => 'Question',
                'name' => $f['q'],
                'acceptedAnswer' => ['@type' => 'Answer', 'text' => $f['a']],
            ], $data['faq']),
        ];
    }
} elseif (preg_match('#^/recipe/([^/]{1,200})$#', $path, $m)) {
    [$code, $recipe] = api_get('/seo/recipe/' . rawurlencode($m[1]), 6 * 3600);
    if ($code === 404) {
        $status = 404;
        $meta['title'] = "Recipe not found — $siteName";
        $meta['robots'] = 'noindex, follow';
    } elseif (is_array($recipe)) {
        $name = (string) ($recipe['name'] ?? 'Recipe');
        $slug = $recipe['slug'] ?: $recipe['id'];
        $meta['title'] = "$name Recipe — Pamangan Recipe Kitchen";
        $desc = trim((string) ($recipe['description'] ?? ''));
        $meta['description'] = clip(($desc ?: "How to make $name.") . ' Ingredients, step-by-step instructions, nutrition and tips.', 160);
        $meta['canonical'] = $base . '/recipe/' . rawurlencode($slug);
        $meta['type'] = 'article';
        if (!empty($recipe['image_url'])) {
            $meta['image'] = $recipe['image_url'];
        }
        $ld[] = recipe_schema($recipe, $meta, $siteName, $base);
        $crumbs = [
            ['Home', '/'], ['Recipe Kitchen', '/kitchen'], ['Recipes', '/recipes'], [$name, '/recipe/' . rawurlencode($slug)],
        ];
    } else {
        // API unreachable: serve generic meta, never a false 404
        $meta['title'] = "Recipe — Pamangan Recipe Kitchen";
    }
} elseif (is_noindex($path, $data['noindex'] ?? [])) {
    $meta['title'] = "Admin — $siteName";
    $meta['robots'] = 'noindex, nofollow';
} else {
    $status = 404;
    $meta['title'] = "Page not found — $siteName";
    $meta['robots'] = 'noindex, follow';
}

if (count($crumbs) > 1) {
    $ld[] = [
        '@context' => 'https://schema.org',
        '@type' => 'BreadcrumbList',
        'itemListElement' => array_map(fn($c, $i) => [
            '@type' => 'ListItem', 'position' => $i + 1, 'name' => $c[0], 'item' => $base . $c[1],
        ], $crumbs, array_keys($crumbs)),
    ];
}

send_html(inject_head($html, $meta, $ld, $site), $status);


// ── Helpers ──────────────────────────────────────────────────────────────────

function send_html(string $html, int $status): void
{
    http_response_code($status);
    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: no-cache, no-store, must-revalidate');
    header('X-Content-Type-Options: nosniff');
    echo $html;
    exit;
}

function e(string $s): string
{
    return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function clip(string $s, int $max): string
{
    $s = trim(preg_replace('/\s+/u', ' ', $s));
    if (mb_strlen($s) <= $max) {
        return $s;
    }
    $cut = mb_substr($s, 0, $max - 1);
    $space = mb_strrpos($cut, ' ');
    return rtrim($space > $max * 0.6 ? mb_substr($cut, 0, $space) : $cut, " ,.;:") . '…';
}

function is_noindex(string $path, array $prefixes): bool
{
    foreach ($prefixes as $p) {
        if ($path === $p || strpos($path, rtrim($p, '/') . '/') === 0) {
            return true;
        }
    }
    return false;
}

function crumbs_for(string $path, string $title): array
{
    if ($path === '/') {
        return [];
    }
    $label = trim(explode('—', explode('|', $title)[0])[0]);
    $kitchen = in_array($path, ['/recipes', '/categories', '/meal-planner'], true);
    return $kitchen
        ? [['Home', '/'], ['Recipe Kitchen', '/kitchen'], [$label, $path]]
        : [['Home', '/'], [$label, $path]];
}

function inject_head(string $html, array $meta, array $ld, array $site): string
{
    // Remove the default tags from index.html, then add the page-specific ones
    $html = preg_replace('#<title>.*?</title>#is', '', $html, 1);
    $html = preg_replace(
        '#<meta\s+(?:name|property)="(?:description|robots|og:title|og:description|og:url|og:image|og:type|twitter:[a-z:]+)"[^>]*>#i',
        '',
        $html
    );
    $html = preg_replace('#<link\s+rel="canonical"[^>]*>#i', '', $html);

    $t = e($meta['title']);
    $d = e($meta['description']);
    $c = e($meta['canonical']);
    $i = e($meta['image']);
    $tags = "<title>$t</title>"
        . "<meta name=\"description\" content=\"$d\">"
        . "<meta name=\"robots\" content=\"" . e($meta['robots']) . "\">"
        . "<link rel=\"canonical\" href=\"$c\">"
        . "<meta property=\"og:type\" content=\"" . e($meta['type']) . "\">"
        . "<meta property=\"og:title\" content=\"$t\">"
        . "<meta property=\"og:description\" content=\"$d\">"
        . "<meta property=\"og:url\" content=\"$c\">"
        . "<meta property=\"og:image\" content=\"$i\">"
        . "<meta name=\"twitter:card\" content=\"summary_large_image\">"
        . "<meta name=\"twitter:title\" content=\"$t\">"
        . "<meta name=\"twitter:description\" content=\"$d\">"
        . "<meta name=\"twitter:image\" content=\"$i\">";
    foreach ($ld as $obj) {
        $json = json_encode($obj, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP);
        if ($json !== false) {
            $tags .= '<script type="application/ld+json">' . $json . '</script>';
        }
    }
    $pos = stripos($html, '</head>');
    return $pos === false ? $html : substr_replace($html, $tags . '</head>', $pos, 7);
}

function iso_duration($text): ?string
{
    if (!is_string($text) || $text === '') {
        return null;
    }
    $t = strtolower($text);
    $min = 0.0;
    if (preg_match('/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)\b/', $t, $x)) {
        $min += (float) $x[1] * 60;
    }
    if (preg_match('/(\d+)\s*(?:m|min|mins|minute|minutes)\b/', $t, $x)) {
        $min += (int) $x[1];
    }
    if ($min == 0 && preg_match('/^\s*(\d+)\s*$/', $t, $x)) {
        $min = (int) $x[1];
    }
    $min = (int) round($min);
    if ($min <= 0) {
        return null;
    }
    $h = intdiv($min, 60);
    $r = $min % 60;
    return 'PT' . ($h ? $h . 'H' : '') . ($r ? $r . 'M' : '');
}

function recipe_schema(array $r, array $meta, string $siteName, string $base): array
{
    $ingredients = [];
    foreach ((array) ($r['ingredients'] ?? []) as $ing) {
        if (is_array($ing)) {
            $line = trim(($ing['quantity'] ?? '') . ' ' . ($ing['item'] ?? ''));
            if (!empty($ing['notes'])) {
                $line .= ' (' . $ing['notes'] . ')';
            }
        } else {
            $line = (string) $ing;
        }
        if ($line !== '') {
            $ingredients[] = $line;
        }
    }
    $steps = [];
    foreach ((array) ($r['instructions'] ?? []) as $step) {
        $text = trim(preg_replace('/^\s*step\s*\d+\s*[:.)-]\s*/i', '', (string) $step));
        if ($text !== '') {
            $steps[] = ['@type' => 'HowToStep', 'text' => $text];
        }
    }
    $schema = [
        '@context' => 'https://schema.org',
        '@type' => 'Recipe',
        'name' => $r['name'] ?? '',
        'description' => $meta['description'],
        'image' => [$meta['image']],
        'url' => $meta['canonical'],
        'author' => ['@type' => 'Organization', 'name' => $siteName, 'url' => "$base/"],
        'publisher' => ['@id' => "$base/#business"],
        'recipeCuisine' => $r['cuisine'] ?? null,
        'recipeIngredient' => $ingredients,
        'recipeInstructions' => $steps,
        'keywords' => implode(', ', array_slice(array_filter((array) ($r['tags'] ?? []), 'is_string'), 0, 10)),
    ];
    $prep = iso_duration($r['prep_time'] ?? null);
    $cook = iso_duration($r['cooking_time'] ?? null);
    if ($prep) {
        $schema['prepTime'] = $prep;
    }
    if ($cook) {
        $schema['cookTime'] = $cook;
    }
    if ($prep || $cook) {
        $total = 0;
        foreach ([$prep, $cook] as $p) {
            if ($p && preg_match('/PT(?:(\d+)H)?(?:(\d+)M)?/', $p, $x)) {
                $total += ((int) ($x[1] ?? 0)) * 60 + (int) ($x[2] ?? 0);
            }
        }
        $schema['totalTime'] = iso_duration($total . ' minutes');
    }
    if (!empty($r['servings'])) {
        $schema['recipeYield'] = (int) $r['servings'] . ' servings';
    }
    if (!empty($r['created_at'])) {
        $schema['datePublished'] = substr((string) $r['created_at'], 0, 10);
    }
    if (!empty($r['updated_at'])) {
        $schema['dateModified'] = substr((string) $r['updated_at'], 0, 10);
    }
    $cal = $r['nutrition']['calories_per_serving'] ?? null;
    if (is_numeric($cal)) {
        $schema['nutrition'] = ['@type' => 'NutritionInformation', 'calories' => round((float) $cal) . ' calories'];
    }
    return array_filter($schema, fn($v) => $v !== null && $v !== '' && $v !== []);
}

function menu_schema(array $data, string $base): array
{
    $sections = [];
    foreach ($data['menu'] as $item) {
        $cat = $item['category'] ?: 'Menu';
        $entry = [
            '@type' => 'MenuItem',
            'name' => $item['name'],
            'description' => trim($item['description'] . ' ' . ($item['serving'] ? '(' . $item['serving'] . ')' : '')),
        ];
        if (!empty($item['image'])) {
            $entry['image'] = $item['image'];
        }
        if (is_numeric($item['price'])) {
            $entry['offers'] = ['@type' => 'Offer', 'price' => (string) $item['price'], 'priceCurrency' => 'CAD'];
        }
        $sections[$cat][] = $entry;
    }
    return [
        '@context' => 'https://schema.org',
        '@type' => 'Menu',
        '@id' => "$base/menu#menu",
        'name' => 'Pamangan Menu',
        'url' => "$base/menu",
        'inLanguage' => 'en-CA',
        'hasMenuSection' => array_map(fn($name, $items) => [
            '@type' => 'MenuSection', 'name' => $name, 'hasMenuItem' => $items,
        ], array_keys($sections), array_values($sections)),
    ];
}

/** GET an API endpoint with a small disk cache. Returns [httpCode, data|null]; code 0 = unreachable. */
function api_get(string $endpoint, int $ttl): array
{
    $dir = __DIR__ . '/.seo-cache';
    if (!is_dir($dir) && @mkdir($dir, 0750, true)) {
        @file_put_contents("$dir/.htaccess", "Require all denied\nDeny from all\n");
    }
    $file = $dir . '/' . sha1($endpoint) . '.json';
    $cached = is_file($file) ? json_decode((string) @file_get_contents($file), true) : null;
    if (is_array($cached) && isset($cached['code'])) {
        $age = time() - (int) ($cached['at'] ?? 0);
        $limit = $cached['code'] === 404 ? 600 : $ttl;  // re-check missing recipes sooner
        if ($age < $limit) {
            return [$cached['code'], $cached['data']];
        }
    }

    $code = 0;
    $body = false;
    if (function_exists('curl_init')) {
        $ch = curl_init(SEO_API . $endpoint);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 3,
            CURLOPT_TIMEOUT => 6,
            CURLOPT_HTTPHEADER => ['Accept: application/json'],
            CURLOPT_USERAGENT => 'pamangan-seo/1.0',
        ]);
        $body = curl_exec($ch);
        $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
    }
    if ($body === false || ($code !== 200 && $code !== 404)) {
        // Unreachable: fall back to a stale copy if we have one
        return is_array($cached) && isset($cached['code']) ? [$cached['code'], $cached['data']] : [0, null];
    }
    $json = json_decode((string) $body, true);
    $result = ['code' => $code, 'data' => $code === 200 ? ($json['data'] ?? null) : null, 'at' => time()];
    if (is_dir($dir)) {
        @file_put_contents($file, json_encode($result), LOCK_EX);
    }
    return [$result['code'], $result['data']];
}
