/**
 * Minimal, deterministic GitHub-Flavored Markdown renderer tailored for
 * previewing README.md faithfully (headings, paragraphs, bold, inline code,
 * links, tables, horizontal rules, and dual-theme <picture> blocks).
 */

export function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderInline(text) {
  let out = escapeHtml(text);

  // Inline code `code`
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold **text**
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Markdown links [label](https://...)
  out = out.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  return out;
}

function parseTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function isTableSeparator(line) {
  const trimmed = line.trim();
  return /^\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?$/.test(trimmed);
}

/**
 * Converts README.md into GitHub-styled HTML.
 * Supports swapping <picture> dark/light sources explicitly via `theme`
 * so the interactive preview theme switcher reflects GitHub Dark & Light modes.
 */
export function renderReadmeHtml(markdown, theme = 'dark') {
  const normalized = markdown.replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');
  const html = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    // Preserve local <picture> block and bind active theme asset
    if (trimmed.startsWith('<picture>')) {
      const block = [];
      while (i < lines.length) {
        block.push(lines[i]);
        if (lines[i].trim().includes('</picture>')) {
          i += 1;
          break;
        }
        i += 1;
      }
      const rawBlock = block.join('\n');
      const darkMatch = rawBlock.match(/prefers-color-scheme:\s*dark\)"\s+srcset="(assets\/[a-z0-9_-]+\.svg)"/i);
      const lightMatch = rawBlock.match(/prefers-color-scheme:\s*light\)"\s+srcset="(assets\/[a-z0-9_-]+\.svg)"/i);
      const fallbackMatch = rawBlock.match(/src="(assets\/[a-z0-9_-]+\.svg)"/i);
      const altMatch = rawBlock.match(/alt="([^"]+)"/i);

      const darkSrc = darkMatch?.[1] ?? fallbackMatch?.[1] ?? '';
      const lightSrc = lightMatch?.[1] ?? fallbackMatch?.[1] ?? '';
      const activeSrc = theme === 'light' ? lightSrc : darkSrc;
      const alt = altMatch?.[1] ?? 'Profile graphic';

      html.push(
        `<div class="gh-media-block"><img src="/${escapeHtml(activeSrc)}" data-dark="/${escapeHtml(darkSrc)}" data-light="/${escapeHtml(lightSrc)}" alt="${escapeHtml(alt)}" class="gh-svg-plate" /></div>`
      );
      continue;
    }

    if (trimmed === '<br />' || trimmed === '<br>') {
      html.push('<div class="gh-spacer" aria-hidden="true"></div>');
      i += 1;
      continue;
    }

    if (trimmed === '---' || trimmed === '***') {
      html.push('<hr />');
      i += 1;
      continue;
    }

    // Footer <sub>...</sub> with safe whitelisted anchor/code tags
    if (trimmed.startsWith('<sub>') && trimmed.endsWith('</sub>')) {
      const inner = trimmed.slice(5, -6);
      const sanitized = inner
        .replace(/<a\s+href="(https?:\/\/[^"]+)">([^<]+)<\/a>/g, (_, href, label) => {
          return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
        })
        .replace(/<code>([^<]+)<\/code>/g, (_, code) => `<code>${escapeHtml(code)}</code>`);
      html.push(`<p class="gh-sub">${sanitized}</p>`);
      i += 1;
      continue;
    }

    // Headings
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      html.push(`<h${level}>${renderInline(headingMatch[2])}</h${level}>`);
      i += 1;
      continue;
    }

    // GFM Table
    if (trimmed.startsWith('|') && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const headers = parseTableRow(trimmed);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(parseTableRow(lines[i]));
        i += 1;
      }

      const thead = `<thead><tr>${headers.map((h) => `<th>${renderInline(h)}</th>`).join('')}</tr></thead>`;
      const tbody = `<tbody>${rows
        .map((r) => `<tr>${r.map((cell) => `<td>${renderInline(cell)}</td>`).join('')}</tr>`)
        .join('')}</tbody>`;
      html.push(`<div class="gh-table-wrap"><table>${thead}${tbody}</table></div>`);
      continue;
    }

    // Paragraph (supports Markdown two-trailing-spaces line breaks)
    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('|') &&
      !lines[i].trim().startsWith('<picture>') &&
      !lines[i].trim().startsWith('<br') &&
      !lines[i].trim().startsWith('<sub>') &&
      lines[i].trim() !== '---'
    ) {
      paraLines.push(lines[i]);
      i += 1;
    }

    const renderedPara = paraLines
      .map((pl, idx) => {
        const hardBreak = /  $/.test(pl);
        const content = renderInline(pl.trim());
        if (idx === paraLines.length - 1) return content;
        return hardBreak ? `${content}<br />` : `${content} `;
      })
      .join('');

    html.push(`<p>${renderedPara}</p>`);
  }

  return html.join('\n');
}
