import http from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateAllAssets } from './scripts/generate-assets.mjs';
import { escapeHtml, renderReadmeHtml } from './scripts/markdown.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const HOST = '0.0.0.0';

// Ensure generated SVG assets exist before serving
if (!existsSync(resolve(__dirname, 'assets/hero-dark.svg'))) {
  generateAllAssets();
}

const MIME_TYPES = {
  '.svg': 'image/svg+xml; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

function renderPage(initialTheme = 'dark', initialView = 'preview') {
  const readmePath = resolve(__dirname, 'README.md');
  const readmeRaw = readFileSync(readmePath, 'utf8');
  const renderedDark = renderReadmeHtml(readmeRaw, 'dark');
  const renderedLight = renderReadmeHtml(readmeRaw, 'light');
  const activeHtml = initialTheme === 'light' ? renderedLight : renderedDark;
  const escapedRaw = escapeHtml(readmeRaw);

  return `<!DOCTYPE html>
<html lang="en" data-theme="${initialTheme}" data-view="${initialView}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Cin — GitHub Profile</title>
  <meta name="description" content="Bespoke, dual-theme GitHub profile README and isometric shader SVG assets for Cin (@sansma123g123456), focused on Java, Minecraft modding, 3D meshes, and GLSL shaders." />
  <meta property="og:title" content="Cin — GitHub Profile" />
  <meta property="og:description" content="Bespoke, dual-theme GitHub profile README and isometric shader SVG assets for Cin (@sansma123g123456)." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700&display=swap" rel="stylesheet" />
  <style>
    :root {
      --bg-page: #0d1117;
      --bg-header: #0d1117;
      --bg-surface: #121821;
      --bg-card: #0d1117;
      --bg-code: #161d27;
      --bg-table-alt: #121821;
      --border: #262f3d;
      --border-subtle: #1d2531;
      --text-primary: #eef2f6;
      --text-secondary: #9aa5b4;
      --text-muted: #818f9f;
      --accent: #ea863e;
      --accent-hover: #f4a261;
      --btn-bg: #eef2f6;
      --btn-text: #0d1117;
      --btn-hover: #d8e1eb;
      --focus-ring: #ea863e;
    }

    html[data-theme="light"] {
      --bg-page: #ffffff;
      --bg-header: #ffffff;
      --bg-surface: #f8fafc;
      --bg-card: #ffffff;
      --bg-code: #f1f5f9;
      --bg-table-alt: #f8fafc;
      --border: #d0d7de;
      --border-subtle: #e5eaf0;
      --text-primary: #161b22;
      --text-secondary: #525d6b;
      --text-muted: #5f6b7a;
      --accent: #b84714;
      --accent-hover: #9a380d;
      --btn-bg: #161b22;
      --btn-text: #ffffff;
      --btn-hover: #2c3540;
      --focus-ring: #b84714;
    }

    *, *::before, *::after {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      background: var(--bg-page);
      color: var(--text-primary);
      font-family: "DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 15px;
      line-height: 1.65;
      -webkit-font-smoothing: antialiased;
      transition: background-color 160ms cubic-bezier(0.16, 1, 0.3, 1), color 160ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* Strict 3-Zone Top Bar Contract */
    .topbar {
      position: sticky;
      top: 0;
      z-index: 20;
      background: var(--bg-header);
      border-bottom: 1px solid var(--border);
    }

    .topbar-inner {
      max-width: 1120px;
      margin: 0 auto;
      padding: 14px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 32px;
    }

    .brand {
      font-family: "Plus Jakarta Sans", -apple-system, sans-serif;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--text-primary);
      text-decoration: none;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .topnav {
      display: flex;
      align-items: center;
      gap: 24px;
      overflow-x: auto;
    }

    .nav-btn {
      appearance: none;
      background: transparent;
      border: none;
      padding: 8px 2px;
      font-family: inherit;
      font-size: 14px;
      font-weight: 500;
      color: var(--text-secondary);
      cursor: pointer;
      white-space: nowrap;
      flex-shrink: 0;
      position: relative;
      transition: color 150ms ease;
    }

    .nav-btn:hover {
      color: var(--text-primary);
    }

    .nav-btn[aria-pressed="true"],
    .nav-btn[aria-current="page"] {
      color: var(--text-primary);
    }

    .nav-btn[aria-pressed="true"]::after,
    .nav-btn[aria-current="page"]::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 2px;
      background: var(--accent);
      border-radius: 1px;
    }

    .nav-btn:focus-visible,
    .primary-btn:focus-visible,
    a:focus-visible {
      outline: 2px solid var(--focus-ring);
      outline-offset: 2px;
      border-radius: 4px;
    }

    .primary-btn {
      appearance: none;
      border: none;
      border-radius: 8px;
      background: var(--btn-bg);
      color: var(--btn-text);
      padding: 9px 18px;
      font-family: inherit;
      font-size: 13.5px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      flex-shrink: 0;
      min-height: 40px;
      transition: background-color 150ms ease, transform 120ms ease;
    }

    .primary-btn:hover {
      background: var(--btn-hover);
    }

    .primary-btn:active {
      transform: scale(0.98);
    }

    /* Main GitHub Profile Frame */
    .shell {
      max-width: 1120px;
      margin: 0 auto;
      padding: 36px 24px 72px;
    }

    .repo-bar {
      max-width: 896px;
      margin: 0 auto 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      font-size: 13px;
      color: var(--text-muted);
      font-family: "JetBrains Mono", ui-monospace, monospace;
    }

    .repo-path {
      color: var(--text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .repo-path strong {
      color: var(--text-primary);
      font-weight: 600;
    }

    .readme-frame {
      max-width: 896px;
      margin: 0 auto;
      padding: 32px;
      border: 1px solid var(--border);
      border-radius: 12px;
      background: var(--bg-card);
    }

    /* Faithful GitHub Markdown Typography */
    .markdown-body > *:first-child {
      margin-top: 0;
    }

    .markdown-body > *:last-child {
      margin-bottom: 0;
    }

    .gh-media-block {
      margin: 0;
      line-height: 0;
    }

    .gh-svg-plate {
      display: block;
      width: 100%;
      height: auto;
      border-radius: 12px;
    }

    .gh-spacer {
      height: 20px;
    }

    .markdown-body p {
      margin: 0 0 16px;
      color: var(--text-secondary);
      max-width: 72ch;
    }

    .markdown-body p strong {
      color: var(--text-primary);
      font-weight: 600;
    }

    .markdown-body h3 {
      margin: 28px 0 16px;
      font-family: "Plus Jakarta Sans", -apple-system, sans-serif;
      font-size: 18px;
      font-weight: 700;
      letter-spacing: -0.015em;
      color: var(--text-primary);
    }

    .markdown-body hr {
      border: none;
      border-top: 1px solid var(--border-subtle);
      margin: 28px 0;
    }

    .markdown-body a {
      color: var(--accent);
      text-decoration: none;
      font-weight: 500;
    }

    .markdown-body a:hover {
      color: var(--accent-hover);
      text-decoration: underline;
    }

    .markdown-body code {
      font-family: "JetBrains Mono", ui-monospace, monospace;
      font-size: 12.5px;
      padding: 2px 6px;
      border-radius: 6px;
      background: var(--bg-code);
      color: var(--text-primary);
    }

    .gh-table-wrap {
      width: 100%;
      overflow-x: auto;
      margin: 8px 0 4px;
    }

    .markdown-body table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
      font-variant-numeric: tabular-nums;
    }

    .markdown-body th,
    .markdown-body td {
      text-align: left;
      padding: 11px 14px;
      border-bottom: 1px solid var(--border-subtle);
    }

    .markdown-body th {
      font-size: 12.5px;
      font-weight: 600;
      color: var(--text-muted);
      border-bottom: 1px solid var(--border);
    }

    .markdown-body td {
      color: var(--text-secondary);
    }

    .markdown-body td strong {
      color: var(--text-primary);
      font-weight: 600;
    }

    .markdown-body tbody tr:nth-child(even) {
      background: var(--bg-table-alt);
    }

    .gh-sub {
      font-size: 12.5px;
      color: var(--text-muted);
      margin-top: 4px;
      max-width: none;
    }

    /* Raw Markdown Panel */
    .raw-panel {
      display: none;
    }

    html[data-view="raw"] .preview-panel {
      display: none;
    }

    html[data-view="raw"] .raw-panel {
      display: block;
    }

    .raw-pre {
      margin: 0;
      padding: 20px;
      border-radius: 8px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      color: var(--text-primary);
      font-family: "JetBrains Mono", ui-monospace, monospace;
      font-size: 13px;
      line-height: 1.65;
      overflow-x: auto;
      white-space: pre;
      tab-size: 2;
    }

    @media (max-width: 720px) {
      .topbar-inner {
        padding: 12px 16px;
        gap: 16px;
      }

      .topnav {
        gap: 14px;
      }

      .nav-btn {
        min-height: 44px;
        font-size: 13.5px;
      }

      .primary-btn {
        min-height: 44px;
        padding: 8px 14px;
        font-size: 13px;
      }

      .shell {
        padding: 20px 14px 48px;
      }

      .readme-frame {
        padding: 18px 16px;
      }

      .repo-bar {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
    }
  </style>
</head>
<body>
  <header class="topbar">
    <div class="topbar-inner">
      <a href="/" class="brand">Cin</a>
      <nav class="topnav" aria-label="Preview modes">
        <button type="button" class="nav-btn" id="btn-dark" aria-current="${initialView === 'preview' && initialTheme === 'dark' ? 'page' : 'false'}">GitHub Dark</button>
        <button type="button" class="nav-btn" id="btn-light" aria-current="${initialView === 'preview' && initialTheme === 'light' ? 'page' : 'false'}">GitHub Light</button>
        <button type="button" class="nav-btn" id="btn-raw" aria-current="${initialView === 'raw' ? 'page' : 'false'}">Source</button>
      </nav>
      <button type="button" class="primary-btn" id="btn-copy">Copy README</button>
    </div>
  </header>

  <main class="shell">
    <div class="repo-bar">
      <span class="repo-path">sansma123g123456 / <strong>README.md</strong></span>
      <span id="theme-meta">${initialView === 'raw' ? 'Markdown Source' : initialTheme === 'light' ? 'GitHub Light Preview' : 'GitHub Dark Preview'}</span>
    </div>

    <article class="readme-frame preview-panel markdown-body" id="preview-panel" aria-label="Rendered GitHub profile README">
      ${activeHtml}
    </article>

    <section class="readme-frame raw-panel" id="raw-panel" aria-label="Raw README markdown source">
      <pre class="raw-pre" id="raw-source">${escapedRaw}</pre>
    </section>
  </main>

  <script>
    (function () {
      const root = document.documentElement;
      const btnDark = document.getElementById('btn-dark');
      const btnLight = document.getElementById('btn-light');
      const btnRaw = document.getElementById('btn-raw');
      const btnCopy = document.getElementById('btn-copy');
      const themeMeta = document.getElementById('theme-meta');
      const rawSource = document.getElementById('raw-source');

      function applyMode(mode) {
        const isRaw = mode === 'raw';
        const theme = mode === 'light' ? 'light' : (mode === 'dark' ? 'dark' : root.getAttribute('data-theme') || 'dark');

        root.setAttribute('data-theme', theme);
        root.setAttribute('data-view', isRaw ? 'raw' : 'preview');

        btnDark.setAttribute('aria-current', !isRaw && theme === 'dark' ? 'page' : 'false');
        btnLight.setAttribute('aria-current', !isRaw && theme === 'light' ? 'page' : 'false');
        btnRaw.setAttribute('aria-current', isRaw ? 'page' : 'false');

        themeMeta.textContent = isRaw
          ? 'Markdown Source'
          : theme === 'light'
            ? 'GitHub Light Preview'
            : 'GitHub Dark Preview';

        if (!isRaw) {
          document.querySelectorAll('.gh-svg-plate').forEach(function (img) {
            const nextSrc = theme === 'light' ? img.getAttribute('data-light') : img.getAttribute('data-dark');
            if (nextSrc && img.getAttribute('src') !== nextSrc) {
              img.setAttribute('src', nextSrc);
            }
          });
        }
      }

      btnDark.addEventListener('click', function () { applyMode('dark'); });
      btnLight.addEventListener('click', function () { applyMode('light'); });
      btnRaw.addEventListener('click', function () { applyMode('raw'); });

      let resetTimer = null;
      btnCopy.addEventListener('click', function () {
        const text = rawSource.textContent || '';
        const markCopied = function () {
          btnCopy.textContent = 'Copied';
          clearTimeout(resetTimer);
          resetTimer = setTimeout(function () {
            btnCopy.textContent = 'Copy README';
          }, 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(markCopied).catch(markCopied);
        } else {
          markCopied();
        }
      });
    })();
  </script>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`);
  const pathname = decodeURIComponent(url.pathname);

  if (pathname === '/' || pathname === '/index.html') {
    const theme = url.searchParams.get('theme') === 'light' ? 'light' : 'dark';
    const view = url.searchParams.get('view') === 'raw' ? 'raw' : 'preview';
    res.writeHead(200, {
      'Content-Type': MIME_TYPES['.html'],
      'Cache-Control': 'no-store',
    });
    res.end(renderPage(theme, view));
    return;
  }

  if (pathname === '/README.md') {
    res.writeHead(200, { 'Content-Type': MIME_TYPES['.md'] });
    res.end(readFileSync(resolve(__dirname, 'README.md')));
    return;
  }

  if (pathname.startsWith('/assets/') && !pathname.includes('..')) {
    const assetPath = resolve(__dirname, pathname.slice(1));
    if (existsSync(assetPath) && extname(assetPath) === '.svg') {
      res.writeHead(200, {
        'Content-Type': MIME_TYPES['.svg'],
        'Cache-Control': 'no-store',
      });
      res.end(readFileSync(assetPath));
      return;
    }
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
});

server.listen(PORT, HOST, () => {
  console.log(`GitHub Profile preview server running at http://localhost:${PORT}`);
});
