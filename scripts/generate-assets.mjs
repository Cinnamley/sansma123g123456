import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '..');
const ASSETS_DIR = resolve(ROOT_DIR, 'assets');

export const PROFILE = {
  name: 'Cin',
  handle: '@sansma123g123456',
  kicker: 'Java  ·  NeoForge & Forge  ·  GLSL Shaders',
  summaryLine1: 'Building responsive combat mechanics, custom 3D',
  summaryLine2: 'entity meshes, and OpenGL shaders for Minecraft.',
  disciplines: 'Game Mechanics  ·  Entity Animation  ·  Render Pipelines',
  diagramCaption: 'isometric mesh · glsl lighting',
  stages: [
    {
      index: '01',
      title: '3D & Rigging',
      stack: 'Blockbench · Blender',
      detail: 'Custom meshes & keyframes',
      icon: 'mesh',
    },
    {
      index: '02',
      title: 'Mod Architecture',
      stack: 'Java · NeoForge',
      detail: 'Combat & gameplay systems',
      icon: 'code',
    },
    {
      index: '03',
      title: 'Shader Pass',
      stack: 'GLSL · OpenGL',
      detail: 'Lighting & particle VFX',
      icon: 'shader',
    },
    {
      index: '04',
      title: 'Runtime Tuning',
      stack: 'Mixin · Profiling',
      detail: 'Frame pacing & game feel',
      icon: 'curve',
    },
  ],
};

export const THEMES = {
  dark: {
    canvas: '#0d1117',
    surface: '#121821',
    cardSurface: '#151c26',
    border: '#262f3d',
    borderSoft: '#1c2430',
    grid: '#1d2633',
    textPrimary: '#eef2f6',
    textSecondary: '#9aa5b4',
    textMuted: '#818f9f',
    accent: '#ea863e',
    accentBright: '#f4a261',
    accentSoft: 'rgba(234, 134, 62, 0.14)',
    cubeEdgeFront: '#4c596b',
    cubeEdgeBack: '#283241',
    facetLight: '#ea863e',
    facetLightOpacity: '0.26',
    facetMid: '#7d8fa6',
    facetMidOpacity: '0.16',
    facetDark: '#1c2533',
    facetDarkOpacity: '0.55',
    facetEdge: '#d9e2ec',
  },
  light: {
    canvas: '#ffffff',
    surface: '#f8fafc',
    cardSurface: '#ffffff',
    border: '#d0d7de',
    borderSoft: '#e5eaf0',
    grid: '#e7edf3',
    textPrimary: '#161b22',
    textSecondary: '#525d6b',
    textMuted: '#5f6b7a',
    accent: '#b84714',
    accentBright: '#d35a22',
    accentSoft: 'rgba(184, 71, 20, 0.10)',
    cubeEdgeFront: '#7c8896',
    cubeEdgeBack: '#c8d1dc',
    facetLight: '#c85019',
    facetLightOpacity: '0.20',
    facetMid: '#6b7c93',
    facetMidOpacity: '0.14',
    facetDark: '#3c4858',
    facetDarkOpacity: '0.18',
    facetEdge: '#2c3540',
  },
};

const SANS_STACK =
  'ui-sans-serif, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Helvetica, Arial, sans-serif';
const MONO_STACK =
  'ui-monospace, SFMono-Regular, &quot;SF Mono&quot;, Menlo, Consolas, monospace';

/**
 * Escapes text content for safe SVG XML interpolation.
 */
export function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

/**
 * Projects a 3D point (x, y, z) using standard orthographic isometric projection
 * centered at (cx, cy). +x goes down-right, +z goes down-left, +y goes up.
 */
export function projectIso(x, y, z, cx = 0, cy = 0) {
  const cos30 = Math.sqrt(3) / 2;
  const sin30 = 0.5;
  return {
    x: Number((cx + (x - z) * cos30).toFixed(2)),
    y: Number((cy + (x + z) * sin30 - y).toFixed(2)),
  };
}

function pointsAttr(points) {
  return points.map((p) => `${p.x},${p.y}`).join(' ');
}

/**
 * Computes WCAG 2.1 relative luminance and contrast ratio for two 6-digit hex colors.
 */
export function contrastRatio(hexA, hexB) {
  const lum = (hex) => {
    const clean = hex.replace('#', '');
    const rgb = [0, 2, 4].map((i) => parseInt(clean.slice(i, i + 2), 16) / 255);
    const linear = rgb.map((c) =>
      c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    );
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  };
  const l1 = lum(hexA);
  const l2 = lum(hexB);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

function renderStageIcon(kind, x, y, stroke, accent) {
  switch (kind) {
    case 'mesh':
      return `<g transform="translate(${x}, ${y})" fill="none" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="8,1 15,5 15,12 8,16 1,12 1,5" stroke="${stroke}" />
        <polyline points="1,5 8,9 15,5" stroke="${stroke}" />
        <line x1="8" y1="9" x2="8" y2="16" stroke="${accent}" />
      </g>`;
    case 'code':
      return `<g transform="translate(${x}, ${y})" fill="none" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="5,4 1,8.5 5,13" stroke="${stroke}" />
        <polyline points="11,4 15,8.5 11,13" stroke="${stroke}" />
        <line x1="9.5" y1="2.5" x2="6.5" y2="14.5" stroke="${accent}" />
      </g>`;
    case 'shader':
      return `<g transform="translate(${x}, ${y})" fill="none" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="8,1.5 15,14 1,14" stroke="${stroke}" />
        <line x1="1" y1="7.5" x2="6.2" y2="7.5" stroke="${accent}" />
        <line x1="9.8" y1="7.5" x2="15.5" y2="5" stroke="${accent}" />
        <line x1="10.8" y1="9.5" x2="15.5" y2="9.5" stroke="${stroke}" opacity="0.7" />
      </g>`;
    case 'curve':
    default:
      return `<g transform="translate(${x}, ${y})" fill="none" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
        <line x1="1.5" y1="14" x2="15" y2="14" stroke="${stroke}" opacity="0.55" />
        <path d="M 2 13 C 5.5 13, 6 3, 10 3 C 12.5 3, 13.5 7, 15 7" stroke="${accent}" />
        <circle cx="10" cy="3" r="1.5" fill="${accent}" stroke="none" />
      </g>`;
  }
}

export function buildHeroSvg(mode) {
  const t = THEMES[mode];
  const W = 900;
  const H = 280;
  const cx = 716;
  const cy = 144;

  // Outer isometric cube vertices (half-size s = 46 so full axes fit with generous margins)
  const s = 46;
  const v = {
    ppp: projectIso(s, s, s, cx, cy),    // front-top
    ppm: projectIso(s, s, -s, cx, cy),   // right-top
    mpp: projectIso(-s, s, s, cx, cy),   // left-top
    mpm: projectIso(-s, s, -s, cx, cy),  // back-top
    pmp: projectIso(s, -s, s, cx, cy),   // front-bottom
    pmm: projectIso(s, -s, -s, cx, cy),  // right-bottom
    mmp: projectIso(-s, -s, s, cx, cy),  // left-bottom
    mmm: projectIso(-s, -s, -s, cx, cy), // back-bottom
  };

  // Inner faceted octahedron (radius r = 30)
  const r = 30;
  const o = {
    top: projectIso(0, r * 1.16, 0, cx, cy),
    bot: projectIso(0, -r * 1.16, 0, cx, cy),
    px: projectIso(r, 0, 0, cx, cy),
    nx: projectIso(-r, 0, 0, cx, cy),
    pz: projectIso(0, 0, r, cx, cy),
    nz: projectIso(0, 0, -r, cx, cy),
  };

  // Coordinate axis tips extending cleanly past outer cube with >= 18px border margin
  const ax = 66;
  const axisX = projectIso(ax, -s, -s, cx, cy);
  const axisY = projectIso(-s, ax, -s, cx, cy);
  const axisZ = projectIso(-s, -s, ax, cx, cy);
  const origin = v.mmm;

  // Light ray & surface normal on lit right-top octahedron face
  const litCentroid = {
    x: Number(((o.top.x + o.px.x + o.nz.x) / 3).toFixed(2)),
    y: Number(((o.top.y + o.px.y + o.nz.y) / 3).toFixed(2)),
  };
  const normalTip = {
    x: Number((litCentroid.x + 26).toFixed(2)),
    y: Number((litCentroid.y - 18).toFixed(2)),
  };
  const lightStart = { x: 828, y: 58 };
  const lightEnd = { x: 772, y: 92 };

  // Subtle ortho grid lines confined to right half
  const gridLines = [];
  for (let gx = 524; gx <= 880; gx += 24) {
    gridLines.push(`<line x1="${gx}" y1="14" x2="${gx}" y2="${H - 14}" />`);
  }
  for (let gy = 26; gy <= H - 20; gy += 24) {
    gridLines.push(`<line x1="504" y1="${gy}" x2="${W - 14}" y2="${gy}" />`);
  }

  const backEdges = [
    [v.mmm, v.mpm],
    [v.mmm, v.pmm],
    [v.mmm, v.mmp],
  ];
  const frontEdges = [
    [v.mpm, v.ppm],
    [v.mpm, v.mpp],
    [v.ppm, v.ppp],
    [v.mpp, v.ppp],
    [v.ppp, v.pmp],
    [v.ppm, v.pmm],
    [v.mpp, v.mmp],
    [v.pmm, v.pmp],
    [v.mmp, v.pmp],
  ];
  const vertexTicks = [v.mpm, v.ppm, v.mpp, v.ppp, v.pmm, v.mmp, v.pmp];

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(PROFILE.name)} (${escapeXml(PROFILE.handle)}) — ${escapeXml(PROFILE.kicker)}">
  <defs>
    <linearGradient id="gridFade-${mode}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0" />
      <stop offset="32%" stop-color="#ffffff" stop-opacity="0.7" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.9" />
    </linearGradient>
    <mask id="rightGridMask-${mode}">
      <rect x="500" y="0" width="400" height="${H}" fill="url(#gridFade-${mode})" />
    </mask>
    <radialGradient id="coreGlow-${mode}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${t.accent}" stop-opacity="${mode === 'dark' ? '0.18' : '0.11'}" />
      <stop offset="100%" stop-color="${t.accent}" stop-opacity="0" />
    </radialGradient>
    <clipPath id="frameClip-${mode}">
      <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="11" />
    </clipPath>
    <style>
      .sans { font-family: ${SANS_STACK}; }
      .mono { font-family: ${MONO_STACK}; }
    </style>
  </defs>

  <!-- Outer container -->
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="12" fill="${t.surface}" stroke="${t.border}" />

  <g clip-path="url(#frameClip-${mode})">
    <!-- Subtle architectural grid on right canvas -->
    <g stroke="${t.grid}" stroke-width="1" mask="url(#rightGridMask-${mode})" opacity="0.72">
      ${gridLines.join('\n      ')}
    </g>

    <!-- Soft ambient shader reflection behind mesh -->
    <circle cx="${cx}" cy="${cy}" r="88" fill="url(#coreGlow-${mode})" />

    <!-- Concentric SDF / shader field arcs -->
    <circle cx="${cx}" cy="${cy}" r="84" fill="none" stroke="${t.borderSoft}" stroke-width="1" stroke-dasharray="3 5" />
    <circle cx="${cx}" cy="${cy}" r="102" fill="none" stroke="${t.borderSoft}" stroke-width="1" opacity="0.65" />

    <!-- Coordinate axes (subtle) -->
    <g stroke="${t.cubeEdgeBack}" stroke-width="1" opacity="0.9">
      <line x1="${origin.x}" y1="${origin.y}" x2="${axisX.x}" y2="${axisX.y}" />
      <line x1="${origin.x}" y1="${origin.y}" x2="${axisY.x}" y2="${axisY.y}" />
      <line x1="${origin.x}" y1="${origin.y}" x2="${axisZ.x}" y2="${axisZ.y}" />
    </g>
    <g class="mono" font-size="10.5" fill="${t.textMuted}">
      <text x="${(axisX.x + 6).toFixed(1)}" y="${(axisX.y + 4).toFixed(1)}">X</text>
      <text x="${(axisY.x - 3.5).toFixed(1)}" y="${(axisY.y - 7).toFixed(1)}">Y</text>
      <text x="${(axisZ.x - 14).toFixed(1)}" y="${(axisZ.y + 4).toFixed(1)}">Z</text>
    </g>

    <!-- Outer voxel bounding cube: rear hidden edges -->
    <g stroke="${t.cubeEdgeBack}" stroke-width="1" stroke-dasharray="3 3">
      ${backEdges.map(([a, b]) => `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" />`).join('\n      ')}
    </g>

    <!-- Inner faceted shader core -->
    <g>
      <polygon points="${pointsAttr([o.top, o.nx, o.pz])}" fill="${t.facetMid}" fill-opacity="${t.facetMidOpacity}" stroke="${t.facetEdge}" stroke-opacity="0.5" stroke-width="1" stroke-linejoin="round" />
      <polygon points="${pointsAttr([o.top, o.pz, o.px])}" fill="${t.facetLight}" fill-opacity="${t.facetLightOpacity}" stroke="${t.accent}" stroke-opacity="0.88" stroke-width="1.25" stroke-linejoin="round" />
      <polygon points="${pointsAttr([o.top, o.px, o.nz])}" fill="${t.facetLight}" fill-opacity="${mode === 'dark' ? '0.38' : '0.30'}" stroke="${t.accentBright}" stroke-opacity="0.95" stroke-width="1.35" stroke-linejoin="round" />
      <polygon points="${pointsAttr([o.bot, o.nx, o.pz])}" fill="${t.facetDark}" fill-opacity="${t.facetDarkOpacity}" stroke="${t.facetEdge}" stroke-opacity="0.38" stroke-width="1" stroke-linejoin="round" />
      <polygon points="${pointsAttr([o.bot, o.pz, o.px])}" fill="${t.facetMid}" fill-opacity="${mode === 'dark' ? '0.14' : '0.12'}" stroke="${t.facetEdge}" stroke-opacity="0.48" stroke-width="1" stroke-linejoin="round" />

      <!-- Surface normal tick N -->
      <line x1="${litCentroid.x}" y1="${litCentroid.y}" x2="${normalTip.x}" y2="${normalTip.y}" stroke="${t.accentBright}" stroke-width="1.2" stroke-dasharray="2 2" />
      <circle cx="${litCentroid.x}" cy="${litCentroid.y}" r="2" fill="${t.accentBright}" />
      <text x="${(normalTip.x + 5).toFixed(1)}" y="${(normalTip.y + 3).toFixed(1)}" class="mono" font-size="10" font-weight="600" fill="${t.accentBright}">N</text>
    </g>

    <!-- Outer voxel bounding cube: front wireframe edges -->
    <g stroke="${t.cubeEdgeFront}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
      ${frontEdges.map(([a, b]) => `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" />`).join('\n      ')}
    </g>

    <!-- Precision vertex markers -->
    <g fill="${t.surface}" stroke="${t.cubeEdgeFront}" stroke-width="1.25">
      ${vertexTicks.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="2.2" />`).join('\n      ')}
    </g>

    <!-- Directional light ray L -->
    <g stroke="${t.accent}" stroke-width="1.35" stroke-linecap="round">
      <line x1="${lightStart.x}" y1="${lightStart.y}" x2="${lightEnd.x}" y2="${lightEnd.y}" />
      <polyline points="${(lightEnd.x + 7.5).toFixed(1)},${(lightEnd.y - 1.5).toFixed(1)} ${lightEnd.x},${lightEnd.y} ${(lightEnd.x + 3.5).toFixed(1)},${(lightEnd.y - 7.5).toFixed(1)}" fill="none" />
    </g>
    <text x="${lightStart.x + 8}" y="${lightStart.y + 3}" class="mono" font-size="10.5" font-weight="600" fill="${t.accent}">L</text>

    <!-- Subtle diagram caption -->
    <text x="${W - 24}" y="${H - 16}" text-anchor="end" class="mono" font-size="10.5" fill="${t.textMuted}">${escapeXml(PROFILE.diagramCaption)}</text>

    <!-- Left Editorial Identity Block -->
    <text x="44" y="58" class="mono" font-size="12.5" font-weight="500" fill="${t.accent}">${escapeXml(PROFILE.kicker)}</text>

    <text x="44" y="120" class="sans" font-size="54" font-weight="700" letter-spacing="-1.6" fill="${t.textPrimary}">${escapeXml(PROFILE.name)}<tspan dx="16" dy="-4" class="mono" font-size="15" font-weight="400" letter-spacing="0" fill="${t.textSecondary}">${escapeXml(PROFILE.handle)}</tspan></text>

    <text x="44" y="158" class="sans" font-size="15.5" font-weight="400" fill="${t.textSecondary}">${escapeXml(PROFILE.summaryLine1)}</text>
    <text x="44" y="182" class="sans" font-size="15.5" font-weight="400" fill="${t.textSecondary}">${escapeXml(PROFILE.summaryLine2)}</text>

    <line x1="44" y1="210" x2="462" y2="210" stroke="${t.border}" stroke-width="1" />

    <text x="44" y="238" class="mono" font-size="12" font-weight="400" fill="${t.textMuted}">${escapeXml(PROFILE.disciplines)}</text>
  </g>
</svg>
`;
}

export function buildPipelineSvg(mode) {
  const t = THEMES[mode];
  const W = 900;
  const H = 126;
  const cardW = 204;
  const cardH = 122;
  const cardY = 2;
  const gap = 28;

  const nodes = PROFILE.stages.map((stage, idx) => {
    const x = idx * (cardW + gap) + 0.5;
    const arrowX1 = x + cardW + 5;
    const arrowX2 = x + cardW + gap - 6;
    const midY = cardY + cardH / 2;

    const connector =
      idx < PROFILE.stages.length - 1
        ? `<g stroke="${t.cubeEdgeFront}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
      <line x1="${arrowX1}" y1="${midY}" x2="${arrowX2}" y2="${midY}" />
      <polyline points="${arrowX2 - 4.5},${midY - 3.5} ${arrowX2},${midY} ${arrowX2 - 4.5},${midY + 3.5}" fill="none" />
    </g>`
        : '';

    return `  <g>
    <rect x="${x}" y="${cardY}" width="${cardW - 1}" height="${cardH}" rx="10" fill="${t.surface}" stroke="${t.border}" />
    <text x="${x + 18}" y="${cardY + 26}" class="mono" font-size="12" font-weight="600" fill="${t.accent}">${escapeXml(stage.index)}</text>
    ${renderStageIcon(stage.icon, x + cardW - 35, cardY + 13, t.textMuted, t.accent)}
    <text x="${x + 18}" y="${cardY + 58}" class="sans" font-size="15" font-weight="600" fill="${t.textPrimary}">${escapeXml(stage.title)}</text>
    <text x="${x + 18}" y="${cardY + 83}" class="mono" font-size="12" font-weight="500" fill="${t.textSecondary}">${escapeXml(stage.stack)}</text>
    <text x="${x + 18}" y="${cardY + 104}" class="sans" font-size="12" font-weight="400" fill="${t.textMuted}">${escapeXml(stage.detail)}</text>
  </g>
  ${connector}`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Minecraft modding and graphics pipeline: 3D and Rigging, Mod Architecture, Shader Pass, Runtime Tuning">
  <defs>
    <style>
      .sans { font-family: ${SANS_STACK}; }
      .mono { font-family: ${MONO_STACK}; }
    </style>
  </defs>
${nodes.join('\n')}
</svg>
`;
}

export function generateAllAssets() {
  mkdirSync(ASSETS_DIR, { recursive: true });
  const files = [
    ['hero-dark.svg', buildHeroSvg('dark')],
    ['hero-light.svg', buildHeroSvg('light')],
    ['pipeline-dark.svg', buildPipelineSvg('dark')],
    ['pipeline-light.svg', buildPipelineSvg('light')],
  ];

  for (const [name, content] of files) {
    writeFileSync(resolve(ASSETS_DIR, name), content, 'utf8');
  }
  return files.map(([name]) => name);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const generated = generateAllAssets();
  console.log(`Generated ${generated.length} SVG assets: ${generated.join(', ')}`);
}
