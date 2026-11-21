/*
  Draws the "Marquee" share card (design A1) on a 1080×1920 canvas: an
  Instagram Story. The film still is the cinema front, a row of bulbs under it,
  the poster pinned on top, the title on a painted sign, then the stars and the
  review on a cream panel. Always dark.

  Instagram covers roughly the top 220px (profile bar) and bottom 260px (reply
  box) of a Story, so nothing important is drawn there.

  Drawn with the Canvas 2D API rather than by screenshotting HTML, because
  HTML-to-image tricks often lose images on iPhone Safari.
*/
export const W = 1080;
export const H = 1920;

const C = {
    wall: '#15110e', ink: '#f1e6cf', ink2: '#d3c5a8', muted: '#a7977b',
    panel: '#f2e6c8', panelInk: '#1e1a16', edge: '#000000',
    red: '#d8352a', yellow: '#f5c21c', bulb: '#ffe58a', paper: '#fffaf0',
};
const SIGN = '"Bowlby One", "Arial Black", sans-serif';
const BODY = 'Archivo, system-ui, sans-serif';
const SAFE_BOTTOM = H - 260;

/* Make sure the site's fonts are ready before measuring text with them. */
export const loadFonts = () => Promise.all([
    document.fonts.load(`400 84px ${SIGN}`),
    document.fonts.load(`600 30px ${BODY}`),
    document.fonts.load(`800 30px ${BODY}`),
]).catch(() => {});

/* Load an image that the canvas may read back (TMDb sends CORS headers). The
   query string keeps it apart from the service worker's no-CORS poster cache. */
export const loadImage = (src) => new Promise((resolve) => {
    if (!src) { resolve(null); return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = `${src}${src.includes('?') ? '&' : '?'}card=1`;
});

/* Draw an image to fill a box, cropping the overflow (CSS object-fit: cover). */
const cover = (ctx, img, x, y, w, h) => {
    const scale = Math.max(w / img.width, h / img.height);
    const sw = w / scale; const sh = h / scale;
    ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h);
};

/* Text with letter spacing, drawn character by character (works in every browser). */
const spaced = (ctx, text, x, y, spacing, align = 'left') => {
    const width = [...text].reduce((s, ch) => s + ctx.measureText(ch).width + spacing, -spacing);
    let cx = align === 'right' ? x - width : x;
    [...text].forEach((ch) => { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + spacing; });
    return width;
};

/* Break text into lines no wider than maxWidth. */
const wrap = (ctx, text, maxWidth) => {
    const lines = [];
    text.split('\n').forEach((para) => {
        let line = '';
        para.split(/\s+/).filter(Boolean).forEach((word) => {
            const next = line ? `${line} ${word}` : word;
            if (ctx.measureText(next).width <= maxWidth || !line) line = next;
            else { lines.push(line); line = word; }
        });
        lines.push(line);
    });
    return lines;
};

/* The biggest font size (from max down to min) at which text fits the box. */
const fit = (ctx, text, { font, max, min, width, height, lineHeight, maxLines = 99 }) => {
    for (let size = max; size >= min; size -= 2) {
        ctx.font = font(size);
        const lines = wrap(ctx, text, width);
        if (lines.length <= maxLines && lines.length * size * lineHeight <= height) return { size, lines };
    }
    ctx.font = font(min);
    return { size: min, lines: wrap(ctx, text, width) };
};

/* A five-point star; `fill` 0–1 draws a partial (half) star. */
const star = (ctx, cx, cy, r, fill, color, shadow) => {
    const path = new Path2D();
    for (let i = 0; i < 10; i += 1) {
        const a = (Math.PI / 5) * i - Math.PI / 2;
        const rad = i % 2 ? r * 0.45 : r;
        const px = cx + Math.cos(a) * rad; const py = cy + Math.sin(a) * rad;
        if (i) path.lineTo(px, py); else path.moveTo(px, py);
    }
    path.closePath();
    ctx.save();
    ctx.beginPath(); ctx.rect(cx - r - 6, cy - r - 6, (2 * r + 12) * fill, 2 * r + 12); ctx.clip();
    ctx.translate(4, 4); ctx.fillStyle = shadow; ctx.fill(path);
    ctx.translate(-4, -4); ctx.fillStyle = color; ctx.fill(path);
    ctx.restore();
};
const stars = (ctx, rating, x, cy, r) => {
    for (let i = 0; i < 5; i += 1) {
        const fill = Math.max(0, Math.min(1, rating - i));
        if (fill > 0) star(ctx, x + r + i * r * 2.25, cy, r, fill === 1 ? 1 : 0.5, C.yellow, C.red);
    }
    return Math.ceil(rating) * r * 2.25;
};

const heart = (ctx, x, y, s, color) => {
    ctx.save(); ctx.fillStyle = color; ctx.beginPath();
    ctx.moveTo(x, y + s * 0.3);
    ctx.bezierCurveTo(x, y, x - s * 0.5, y, x - s * 0.5, y + s * 0.3);
    ctx.bezierCurveTo(x - s * 0.5, y + s * 0.6, x, y + s * 0.8, x, y + s);
    ctx.bezierCurveTo(x, y + s * 0.8, x + s * 0.5, y + s * 0.6, x + s * 0.5, y + s * 0.3);
    ctx.bezierCurveTo(x + s * 0.5, y, x, y, x, y + s * 0.3);
    ctx.fill(); ctx.restore();
};

/* Worn ink: punch random specks out of a stamp canvas (fixed seed, same every time). */
const wear = (g, w, h, specks, seed0 = 7) => {
    g.globalCompositeOperation = 'destination-out';
    let seed = seed0;
    const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let k = 0; k < specks; k += 1) {
        g.globalAlpha = 0.25 + rand() * 0.6;
        g.beginPath(); g.arc(rand() * w, rand() * h, 0.6 + rand() * 2.4, 0, Math.PI * 2); g.fill();
    }
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
};
const press = (ctx, stampCanvas, cx, cy, degrees, alpha = 0.93) => {
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate((degrees * Math.PI) / 180); ctx.globalAlpha = alpha;
    ctx.drawImage(stampCanvas, -stampCanvas.width / 2, -stampCanvas.height / 2);
    ctx.restore();
};

/* Round red rubber stamp reading ADIT'S CINEMA, with a starred double ring. */
const nameStamp = (r) => {
    const s = document.createElement('canvas');
    s.width = s.height = r * 2 + 20;
    const g = s.getContext('2d'); const o = r + 10;
    g.strokeStyle = C.red; g.fillStyle = C.red;
    g.lineWidth = 8; g.beginPath(); g.arc(o, o, r - 5, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 3; g.beginPath(); g.arc(o, o, r - 18, 0, Math.PI * 2); g.stroke();
    g.textAlign = 'center';
    g.font = `400 ${Math.round(r * 0.18)}px ${BODY}`;
    [-1, 1].forEach((side) => g.fillText('★', o + side * r * 0.62, o + r * 0.07));
    g.font = `400 ${Math.round(r * 0.36)}px ${SIGN}`;
    g.fillText("ADIT'S", o, o - r * 0.05);
    g.fillText('CINEMA', o, o + r * 0.36);
    wear(g, s.width, s.height, Math.round(r * 5));
    return s;
};

/* Rectangular date stamp: DIARY · 15 JUN 2026 in a double border. */
const dateStamp = (label) => {
    const s = document.createElement('canvas');
    const m = s.getContext('2d'); m.font = `800 24px ${BODY}`;
    const tw = [...label].reduce((t, ch) => t + m.measureText(ch).width + 3, -3);
    s.width = tw + 64; s.height = 74;
    const g = s.getContext('2d');
    g.strokeStyle = C.red; g.fillStyle = C.red;
    g.lineWidth = 5; g.strokeRect(5, 5, s.width - 10, s.height - 10);
    g.lineWidth = 2; g.strokeRect(13, 13, s.width - 26, s.height - 26);
    g.font = `800 24px ${BODY}`; spaced(g, label, 32, 46, 3);
    // Wear the ink only, then lay it on a cream paper tag
    wear(g, s.width, s.height, 260, 11);
    const tag = document.createElement('canvas'); tag.width = s.width + 12; tag.height = s.height + 12;
    const t = tag.getContext('2d');
    t.fillStyle = C.edge; t.fillRect(8, 8, s.width, s.height);
    t.fillStyle = C.panel; t.fillRect(0, 0, s.width, s.height);
    t.drawImage(s, 0, 0);
    return tag;
};


/* ---------- Stamp styles (options being compared) ---------- */
const INK = '#e23a2c';
const blank = (w, h) => { const c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h); return [c, c.getContext('2d')]; };
/* Letters along a circle: on top reading clockwise, or along the bottom reading left to right. */
const arcText = (g, text, cx, cy, radius, top, spacing = 1) => {
    const chars = [...text];
    const widths = chars.map((ch) => g.measureText(ch).width * spacing);
    const total = widths.reduce((a, b) => a + b, 0) / radius;
    let a = top ? -Math.PI / 2 - total / 2 : Math.PI / 2 + total / 2;
    chars.forEach((ch, i) => {
        const half = widths[i] / 2 / radius;
        a += top ? half : -half;
        g.save(); g.translate(cx + radius * Math.cos(a), cy + radius * Math.sin(a));
        g.rotate(top ? a + Math.PI / 2 : a - Math.PI / 2);
        g.textAlign = 'center'; g.fillText(ch, 0, 0); g.restore();
        a += top ? half : -half;
    });
};
const ticketPath = (g, x, y, w, h, notch) => {
    g.beginPath();
    g.moveTo(x + notch, y); g.lineTo(x + w - notch, y);
    g.arc(x + w, y, notch, Math.PI, Math.PI / 2, true);
    g.lineTo(x + w, y + h / 2 - notch); g.arc(x + w, y + h / 2, notch, -Math.PI / 2, Math.PI / 2, true);
    g.lineTo(x + w, y + h - notch); g.arc(x + w, y + h, notch, -Math.PI / 2, Math.PI, true);
    g.lineTo(x + notch, y + h); g.arc(x, y + h, notch, 0, -Math.PI / 2, true);
    g.lineTo(x, y + h / 2 + notch); g.arc(x, y + h / 2, notch, Math.PI / 2, -Math.PI / 2, true);
    g.lineTo(x, y + notch); g.arc(x, y, notch, Math.PI / 2, 0, true);
    g.closePath();
};

/* Bottom: ADIT'S CINEMA. Returns { canvas, anchor } where anchor is how far the
   stamp's top may overlap the panel (it only ever covers the panel's padding). */
export const NAME_STYLES = ['box', 'seal', 'ticket', 'postmark'];
const nameStampStyled = (style) => {
    let c; let g;
    if (style === 'box') {
        [c, g] = blank(300, 196);
        g.strokeStyle = INK; g.fillStyle = INK;
        g.lineWidth = 7; g.strokeRect(6, 6, 288, 184);
        g.lineWidth = 2; g.strokeRect(18, 18, 264, 160);
        g.textAlign = 'center';
        g.font = `400 52px ${SIGN}`; g.fillText("ADIT'S", 150, 82); g.fillText('CINEMA', 150, 134);
        g.font = `800 17px ${BODY}`; g.textAlign = 'left'; spaced(g, '★ EST. 2023 ★', 150 - 66, 164, 3);
    } else if (style === 'seal') {
        [c, g] = blank(250, 250);
        const o = 125;
        g.strokeStyle = INK; g.fillStyle = INK;
        g.lineWidth = 7; g.beginPath(); g.arc(o, o, 116, 0, Math.PI * 2); g.stroke();
        g.lineWidth = 2; g.beginPath(); g.arc(o, o, 104, 0, Math.PI * 2); g.stroke();
        g.lineWidth = 2; g.beginPath(); g.arc(o, o, 56, 0, Math.PI * 2); g.stroke();
        g.font = `400 34px ${SIGN}`;
        arcText(g, "ADIT'S", o, o, 70, true, 1.25);
        arcText(g, 'CINEMA', o, o, 92, false, 1.18);
        g.font = `400 56px ${BODY}`; g.textAlign = 'center'; g.fillText('★', o, o + 20);
        g.font = `400 22px ${BODY}`; g.fillText('★', o - 96, o + 8); g.fillText('★', o + 96, o + 8);
    } else if (style === 'ticket') {
        // Ticket outline, box-office lettering: ADIT'S / CINEMA stacked, ★ EST. 2023 ★
        [c, g] = blank(330, 212);
        g.strokeStyle = INK; g.fillStyle = INK;
        g.lineWidth = 7; ticketPath(g, 8, 8, 314, 196, 20); g.stroke();
        g.setLineDash([8, 7]); g.lineWidth = 2.5; ticketPath(g, 23, 23, 284, 166, 13); g.stroke(); g.setLineDash([]);
        g.textAlign = 'center';
        g.font = `400 54px ${SIGN}`; g.fillText("ADIT'S", 165, 96); g.fillText('CINEMA', 165, 148);
        g.font = `800 17px ${BODY}`; g.textAlign = 'left'; spaced(g, '★ EST. 2023 ★', 165 - 66, 180, 3);
    } else {
        [c, g] = blank(470, 210);
        const o = 105;
        g.strokeStyle = INK; g.fillStyle = INK;
        g.lineWidth = 6; g.beginPath(); g.arc(o, o, 96, 0, Math.PI * 2); g.stroke();
        g.lineWidth = 2; g.beginPath(); g.arc(o, o, 84, 0, Math.PI * 2); g.stroke();
        g.textAlign = 'center'; g.font = `400 34px ${SIGN}`;
        g.fillText("ADIT'S", o, o - 2); g.fillText('CINEMA', o, o + 34);
        g.font = `800 14px ${BODY}`; g.fillText('★ ★ ★', o, o - 44);
        // Wavy cancellation lines trailing to the right
        g.lineWidth = 5;
        [-46, -16, 14, 44].forEach((dy) => {
            g.beginPath();
            for (let x = 0; x <= 250; x += 4) {
                const px = o + 104 + x; const py = o + dy + Math.sin(x / 16) * 7;
                if (x) g.lineTo(px, py); else g.moveTo(px, py);
            }
            g.stroke();
        });
    }
    wear(g, c.width, c.height, Math.round((c.width * c.height) / 90), 7);
    return c;
};

/* Top: the diary date, small. Each sits on cream paper so it reads on any still. */
export const DATE_STYLES = ['tag', 'due', 'round', 'stub', 'clapper', 'dater', 'postage'];
const paperBacked = (ink, pad, shape, shadow = 6) => {
    const [t, g] = blank(ink.width + shadow, ink.height + shadow);
    g.fillStyle = C.edge;
    if (shape === 'round') { g.beginPath(); g.arc(ink.width / 2 + shadow, ink.height / 2 + shadow, ink.width / 2, 0, Math.PI * 2); g.fill(); }
    else g.fillRect(shadow, shadow, ink.width, ink.height);
    g.fillStyle = C.panel;
    if (shape === 'round') { g.beginPath(); g.arc(ink.width / 2, ink.height / 2, ink.width / 2, 0, Math.PI * 2); g.fill(); }
    else g.fillRect(0, 0, ink.width, ink.height);
    g.drawImage(ink, 0, 0);
    return t;
};
const dateStampStyled = (style, watched) => {
    const d = new Date(watched);
    const day = d.getDate(); const mon = d.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase().replace('SEPT', 'SEP'); const yr = d.getFullYear();
    let c; let g;
    if (style === 'tag') {
        const label = `DIARY · ${day} ${mon} ${yr}`;
        [c, g] = blank(10, 10); g.font = `800 18px ${BODY}`;
        const tw = [...label].reduce((t, ch) => t + g.measureText(ch).width + 2.6, -2.6);
        [c, g] = blank(tw + 48, 56);
        g.strokeStyle = INK; g.fillStyle = INK;
        g.lineWidth = 4; g.strokeRect(5, 5, c.width - 10, c.height - 10);
        g.lineWidth = 1.5; g.strokeRect(11, 11, c.width - 22, c.height - 22);
        g.font = `800 18px ${BODY}`; spaced(g, label, 24, 35, 2.6);
        wear(g, c.width, c.height, 160, 11);
        return paperBacked(c, 0, 'rect');
    }
    if (style === 'due') {
        [c, g] = blank(196, 92);
        g.strokeStyle = INK; g.fillStyle = INK;
        g.lineWidth = 3; g.strokeRect(4, 4, 188, 84);
        g.beginPath(); g.moveTo(4, 32); g.lineTo(192, 32); g.stroke();
        g.font = `800 15px ${BODY}`; spaced(g, 'SEEN', 16, 24, 4);
        g.textAlign = 'right'; g.font = `800 15px ${BODY}`; g.fillText('DIARY', 180, 24); g.textAlign = 'left';
        g.font = `800 34px ${BODY}`; g.textAlign = 'center'; g.fillText(`${day} ${mon} ${String(yr).slice(2)}`, 98, 74);
        wear(g, c.width, c.height, 170, 13);
        return paperBacked(c, 0, 'rect');
    }
    const dd = String(day).padStart(2, '0');
    if (style === 'stub') {
        // A tiny ticket, matching the bottom stamp
        [c, g] = blank(236, 98);
        g.strokeStyle = INK; g.fillStyle = INK;
        g.lineWidth = 4; ticketPath(g, 4, 4, 228, 90, 12); g.stroke();
        g.setLineDash([5, 5]); g.lineWidth = 1.5; ticketPath(g, 14, 14, 208, 70, 8); g.stroke(); g.setLineDash([]);
        g.textAlign = 'center';
        g.font = `800 14px ${BODY}`; g.fillText('★ DIARY ★', 118, 38);
        let fs = 26; g.font = `400 ${fs}px ${SIGN}`;
        while (g.measureText(`${day} ${mon} ${yr}`).width > 168) { fs -= 1; g.font = `400 ${fs}px ${SIGN}`; }
        g.fillText(`${day} ${mon} ${yr}`, 118, 70);
        wear(g, c.width, c.height, 150, 19);
        const [t, tg] = blank(c.width + 6, c.height + 6);
        tg.fillStyle = C.edge; ticketPath(tg, 6, 6, 232, 94, 14); tg.fill();
        tg.fillStyle = C.panel; ticketPath(tg, 0, 0, 232, 94, 14); tg.fill();
        tg.drawImage(c, 0, 0);
        return t;
    }
    if (style === 'clapper') {
        // A small film slate: striped clapper bar, SCENE / DIARY, the date on the board
        const w = 210; const h = 124;
        const [ink, g2] = blank(w, h);
        g2.save(); g2.translate(0, 30); g2.rotate((-7 * Math.PI) / 180);
        g2.fillStyle = INK; g2.fillRect(0, -24, w + 4, 24);
        g2.globalCompositeOperation = 'destination-out';
        for (let x = 6; x < w + 10; x += 34) { g2.beginPath(); g2.moveTo(x, -24); g2.lineTo(x + 16, -24); g2.lineTo(x + 4, 0); g2.lineTo(x - 12, 0); g2.closePath(); g2.fill(); }
        g2.restore(); g2.globalCompositeOperation = 'source-over';
        g2.fillStyle = INK; g2.strokeStyle = INK;
        g2.fillRect(0, 32, w, 4); g2.lineWidth = 3; g2.strokeRect(2, 34, w - 4, h - 36);
        g2.beginPath(); g2.moveTo(2, 68); g2.lineTo(w - 2, 68); g2.stroke();
        g2.font = `800 13px ${BODY}`; spaced(g2, 'SCENE', 12, 56, 2); spaced(g2, 'DIARY', w - 74, 56, 2);
        g2.textAlign = 'center'; g2.font = `400 30px ${SIGN}`;
        g2.fillText(`${dd}·${String(d.getMonth() + 1).padStart(2, '0')}·${String(yr).slice(2)}`, w / 2, 106);
        wear(g2, w, h, 120, 23);
        const [t, tg] = blank(w + 6, h + 6);
        tg.fillStyle = C.edge; tg.fillRect(6, 40, w, h - 34);
        tg.fillStyle = C.panel; tg.fillRect(0, 34, w, h - 34);
        tg.save(); tg.translate(0, 30); tg.rotate((-7 * Math.PI) / 180); tg.fillRect(0, -24, w + 4, 24); tg.restore();
        tg.drawImage(ink, 0, 0);
        return t;
    }
    if (style === 'dater') {
        // Office date stamper: day | month | year in boxes, DIARY above
        [c, g] = blank(262, 96);
        g.strokeStyle = INK; g.fillStyle = INK;
        g.lineWidth = 4; g.strokeRect(4, 4, 254, 88);
        g.font = `800 13px ${BODY}`; g.textAlign = 'center'; g.fillText('— DIARY —', 131, 25);
        const boxes = [[dd, 14, 56], [mon, 78, 76], [String(yr), 162, 86]];
        g.lineWidth = 2;
        boxes.forEach(([txt, x, w]) => { g.strokeRect(x, 34, w, 46); g.font = `400 26px ${SIGN}`; g.fillText(txt, x + w / 2, 68); });
        wear(g, c.width, c.height, 160, 29);
        return paperBacked(c, 0, 'rect');
    }
    if (style === 'postage') {
        // A little postage stamp with serrated edges
        const w = 150; const h = 120; const R = 6;
        [c, g] = blank(w, h);
        g.fillStyle = C.panel;
        g.beginPath(); g.rect(0, 0, w, h); g.fill();
        g.globalCompositeOperation = 'destination-out';
        const holes = [];
        for (let x = R; x < w; x += R * 2.4) holes.push([x, 0], [x, h]);
        for (let y = R; y < h; y += R * 2.4) holes.push([0, y], [w, y]);
        const paper = g;
        holes.forEach(([hx, hy]) => { paper.beginPath(); paper.arc(hx, hy, R, 0, Math.PI * 2); paper.fill(); });
        g.globalCompositeOperation = 'source-over';
        const [ink, ig] = blank(w, h);
        ig.strokeStyle = INK; ig.fillStyle = INK;
        ig.lineWidth = 2.5; ig.strokeRect(14, 14, w - 28, h - 28);
        ig.textAlign = 'center';
        ig.font = `800 13px ${BODY}`; ig.fillText('DIARY', w / 2, 38);
        ig.font = `400 34px ${SIGN}`; ig.fillText(String(day), w / 2, 72);
        ig.font = `800 15px ${BODY}`; ig.fillText(`${mon} ${yr}`, w / 2, 94);
        wear(ig, w, h, 120, 31);
        g.drawImage(ink, 0, 0);
        const [t, tg] = blank(w + 6, h + 6);
        tg.globalAlpha = 0.9; tg.drawImage(c, 6, 6); tg.globalCompositeOperation = 'source-in'; tg.fillStyle = C.edge; tg.fillRect(0, 0, w + 6, h + 6);
        tg.globalCompositeOperation = 'source-over'; tg.globalAlpha = 1; tg.drawImage(c, 0, 0);
        return t;
    }
    [c, g] = blank(132, 132);
    const o = 66;
    g.strokeStyle = INK; g.fillStyle = INK;
    g.lineWidth = 4; g.beginPath(); g.arc(o, o, 58, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 1.5; g.beginPath(); g.arc(o, o, 50, 0, Math.PI * 2); g.stroke();
    g.font = `800 13px ${BODY}`; arcText(g, 'DIARY', o, o, 37, true, 1.6); arcText(g, String(yr), o, o, 45, false, 1.6);
    g.textAlign = 'center'; g.font = `400 30px ${SIGN}`; g.fillText(String(day), o, o + 8);
    g.font = `800 15px ${BODY}`; g.fillText(mon, o, o + 28);
    wear(g, c.width, c.height, 150, 17);
    return paperBacked(c, 0, 'round');
};

const shortDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase();
const longDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

/*
  film: { title, year, director, runtime, genres[], rating, watched, liked, rewatch, review }
  images: { still, poster } (loaded Image objects or null)
  domain: printed in the footer
*/
export const drawCard = (canvas, film, images, domain = 'cinema.aditakbars.com', brand = 'stamp', look = {}) => {
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'alphabetic';

    // Wall
    ctx.fillStyle = C.wall; ctx.fillRect(0, 0, W, H);

    // The still: the cinema front
    const STILL_H = 920;
    if (images.still) cover(ctx, images.still, 0, 0, W, STILL_H);
    else { ctx.fillStyle = '#2a211a'; ctx.fillRect(0, 0, W, STILL_H); }
    let g = ctx.createLinearGradient(0, 0, 0, STILL_H);
    g.addColorStop(0, 'rgba(0,0,0,.6)'); g.addColorStop(0.26, 'rgba(0,0,0,0)');
    g.addColorStop(0.68, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(21,17,14,.92)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, STILL_H);

    // Marquee bulbs
    ctx.fillStyle = C.edge; ctx.fillRect(0, STILL_H, W, 38);
    ctx.fillStyle = C.red; ctx.fillRect(0, STILL_H + 6, W, 26);
    for (let x = 26; x < W; x += 52) {
        ctx.beginPath(); ctx.arc(x, STILL_H + 19, 9, 0, Math.PI * 2); ctx.fillStyle = C.yellow; ctx.fill();
        ctx.beginPath(); ctx.arc(x, STILL_H + 19, 6, 0, Math.PI * 2); ctx.fillStyle = C.bulb; ctx.fill();
    }

    // One small label at the top (just below Instagram's top bar): the diary date
    if (film.watched) {
        ctx.font = `800 20px ${BODY}`;
        const label = `DIARY · ${shortDate(film.watched)}`;
        const tw = [...label].reduce((s, ch) => s + ctx.measureText(ch).width + 3, -3);
        if (look.date) {
            const ds = dateStampStyled(look.date, film.watched);
            press(ctx, ds, W - 80 - ds.width / 2, 250 + ds.height / 2 - 20, -6, 0.97);
        } else if (brand === 'sign') {
            const ds = dateStamp(label);
            press(ctx, ds, W - 80 - ds.width / 2, 262, -5, 0.95);
        } else {
            const px = W - 80 - tw - 28;
            ctx.fillStyle = C.edge; ctx.fillRect(px - 3, 237, tw + 34, 46);
            ctx.fillStyle = C.red; ctx.fillRect(px, 240, tw + 28, 40);
            ctx.fillStyle = C.paper; spaced(ctx, label, px + 14, 267, 3);
        }
    }

    const noReview = !film.review;
    // Poster, pinned at a slight angle; bigger when there's no review to make room for
    const P = noReview ? { x: 80, y: 520, w: 380, h: 570 } : { x: 80, y: 560, w: 300, h: 450 };
    if (images.poster) {
        ctx.save();
        ctx.translate(P.x + P.w / 2, P.y + P.h / 2); ctx.rotate((-3 * Math.PI) / 180);
        ctx.fillStyle = C.edge; ctx.fillRect(-P.w / 2 - 10 + 12, -P.h / 2 - 10 + 12, P.w + 20, P.h + 20);
        ctx.fillStyle = C.paper; ctx.fillRect(-P.w / 2 - 10, -P.h / 2 - 10, P.w + 20, P.h + 20);
        cover(ctx, images.poster, -P.w / 2, -P.h / 2, P.w, P.h);
        ctx.restore();
    }
    const posterBottom = P.y + P.h + 20;

    // Title on a painted yellow sign, straddling the bottom of the still
    const TX = P.x + P.w + 40; const TMAX = W - 70 - TX;
    const title = fit(ctx, film.title.toUpperCase(), {
        font: (s) => `400 ${s}px ${SIGN}`, max: 84, min: 34, width: TMAX - 56, height: 240, lineHeight: 1, maxLines: 3,
    });
    ctx.font = `400 ${title.size}px ${SIGN}`;
    const tW = Math.max(...title.lines.map((l) => ctx.measureText(l).width)) + 56;
    const tH = title.lines.length * title.size * 0.98 + 34;
    const TY = noReview ? 820 : 850;
    ctx.fillStyle = C.red; ctx.fillRect(TX + 10, TY + 10, tW + 14, tH + 14);
    ctx.fillStyle = C.edge; ctx.fillRect(TX, TY, tW + 14, tH + 14);
    ctx.fillStyle = C.yellow; ctx.fillRect(TX + 7, TY + 7, tW, tH);
    title.lines.forEach((line, i) => {
        const y = TY + 7 + 22 + (i + 1) * title.size * 0.92;
        ctx.fillStyle = C.edge; ctx.fillText(line, TX + 7 + 28 + 4, y + 4);
        ctx.fillStyle = C.red; ctx.fillText(line, TX + 7 + 28, y);
    });
    let y = TY + tH + 14;

    // Film facts beside the poster
    ctx.font = `600 30px ${BODY}`; ctx.fillStyle = C.ink2;
    const facts = [
        [film.year, film.director].filter(Boolean).join(' · '),
        [film.runtime ? `${Math.floor(film.runtime / 60)}h ${String(film.runtime % 60).padStart(2, '0')}m` : null,
            (film.genres || []).slice(0, 2).join(', ')].filter(Boolean).join(' · '),
    ].filter(Boolean);
    facts.forEach((line) => { y += 42; ctx.fillText(wrap(ctx, line, TMAX)[0], TX, y); });

    // Stars, liked, rewatch: in the same column, beside the poster
    const R = noReview ? 40 : 28;
    y += 26;
    let x = TX;
    if (film.rating) x += stars(ctx, film.rating, TX, y + R, R) + 22;
    ctx.font = `700 28px ${BODY}`; ctx.fillStyle = C.ink2;
    const lineY = y + R + 10;
    const marks = [film.liked && 'Liked', film.rewatch && '↻ Rewatch'].filter(Boolean);
    if (marks.length && x + 160 > W - 70) { x = TX; y += R * 2 + 16; }
    const markY = marks.length && x === TX && film.rating ? y + R + 10 : lineY;
    if (film.liked) { heart(ctx, x + 12, markY - 21, 24, C.red); ctx.fillText('Liked', x + 32, markY); x += 32 + ctx.measureText('Liked').width + 24; }
    if (film.rewatch) ctx.fillText('↻ Rewatch', x, markY);
    y = Math.max(y + R * 2, posterBottom) + 50;

    const FOOT_Y = SAFE_BOTTOM - 20;
    const RESERVE = { stamp: 0, sign: 60, stub: 150 }[brand] || 0;
    let panel = null;
    if (!noReview) {
        // The review, on a cream panel, as big as it can be
        const PX = 80; const PW = W - 160 - 10; const PAD = 38;
        const room = FOOT_Y - RESERVE - 60 - y - PAD * 2;
        const quote = fit(ctx, `“${film.review.trim()}”`, {
            font: (s) => `${s >= 52 ? 800 : 600} ${s}px ${BODY}`, max: 72, min: 30, width: PW - PAD * 2, height: room, lineHeight: 1.3,
        });
        const PH = quote.lines.length * quote.size * 1.3 + PAD * 2 - quote.size * 0.25;
        ctx.fillStyle = C.red; ctx.fillRect(PX + 10, y + 10, PW, PH);
        ctx.fillStyle = C.edge; ctx.fillRect(PX - 6, y - 6, PW + 12, PH + 12);
        ctx.fillStyle = C.panel; ctx.fillRect(PX, y, PW, PH);
        ctx.font = `${quote.size >= 52 ? 800 : 600} ${quote.size}px ${BODY}`; ctx.fillStyle = C.panelInk;
        quote.lines.forEach((line, i) => ctx.fillText(line, PX + PAD, y + PAD + quote.size * 0.95 + i * quote.size * 1.3));
        panel = { x: PX, y, w: PW, h: PH };
    } else if (film.watched) {
        ctx.font = `600 34px ${BODY}`; ctx.fillStyle = C.ink2;
        ctx.fillText(`Watched ${longDate(film.watched)}`, 80, y + 10);
    }

    // The signature, just above Instagram's reply box
    if (brand === 'stamp') {
        // Pressed on the panel's bottom-left corner: it covers the border and the
        // padding only, never the words; the review keeps its full size.
        const r = 112;
        const cx = panel ? panel.x + 170 : 80 + r + 10;
        const cy = panel ? panel.y + panel.h + r - 28 : FOOT_Y - r - 10;
        if (look.name) {
            const ns = nameStampStyled(look.name);
            const nx = panel ? panel.x + 30 + ns.width / 2 : 80 + ns.width / 2;
            // Round stamps may dip ~20px into the panel's bottom padding; tilted
            // rectangles lift a corner, so they only kiss the edge.
            const dip = look.name === 'seal' || look.name === 'postmark' ? 20 : -2;
            const ny = panel ? panel.y + panel.h - dip + ns.height / 2 : FOOT_Y - ns.height / 2 - 10;
            press(ctx, ns, nx, ny, look.name === 'postmark' ? -4 : -8);
        } else press(ctx, nameStamp(r), cx, cy, -10);
        ctx.font = `800 30px ${BODY}`; ctx.fillStyle = C.yellow;
        ctx.textAlign = 'right'; ctx.fillText(domain, W - 80, FOOT_Y); ctx.textAlign = 'left';
    } else if (brand === 'sign') {
        ctx.font = `400 78px ${SIGN}`;
        ['#000', C.red].forEach((col, k) => { ctx.fillStyle = col; ctx.fillText("ADIT'S CINEMA", 80 + (k ? 5 : 10), FOOT_Y - 8 + (k ? 5 : 10)); });
        ctx.fillStyle = C.yellow; ctx.fillText("ADIT'S CINEMA", 80, FOOT_Y - 8);
        ctx.font = `800 26px ${BODY}`; ctx.fillStyle = C.ink2;
        spaced(ctx, domain.toUpperCase(), 84, FOOT_Y + 34, 3);
    } else if (brand === 'stub') {
        const sy = FOOT_Y - 120; const sh = 140;
        ctx.fillStyle = C.edge; ctx.fillRect(66, sy + 6, W - 132, sh);
        ctx.fillStyle = C.panel; ctx.fillRect(60, sy, W - 132, sh);
        ctx.fillStyle = C.wall;
        [[60, sy + sh / 2], [W - 72, sy + sh / 2]].forEach(([nx, ny]) => { ctx.beginPath(); ctx.arc(nx, ny, 22, 0, Math.PI * 2); ctx.fill(); });
        ctx.strokeStyle = C.panelInk; ctx.lineWidth = 4; ctx.setLineDash([10, 10]);
        ctx.beginPath(); ctx.moveTo(W - 330, sy + 18); ctx.lineTo(W - 330, sy + sh - 18); ctx.stroke(); ctx.setLineDash([]);
        ctx.font = `800 20px ${BODY}`; ctx.fillStyle = C.red; spaced(ctx, 'ADMIT ONE', 110, sy + 44, 5);
        ctx.font = `400 60px ${SIGN}`; ctx.fillStyle = C.panelInk; ctx.fillText("ADIT'S CINEMA", 113, sy + 113);
        ctx.fillStyle = C.red; ctx.fillText("ADIT'S CINEMA", 110, sy + 110);
        ctx.font = `800 21px ${BODY}`; ctx.fillStyle = C.panelInk;
        const [host, ...rest] = domain.split('.');
        ctx.fillText(`${host}.`, W - 300, sy + 64); ctx.fillText(rest.join('.'), W - 300, sy + 94);
    }
};

export const fileName = (film) => `adits-cinema-${film.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}${film.watched ? `-${film.watched}` : ''}.png`;
