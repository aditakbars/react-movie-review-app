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

const shortDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase();
const longDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

/*
  film: { title, year, director, runtime, genres[], rating, watched, liked, rewatch, review }
  images: { still, poster } (loaded Image objects or null)
  domain: printed in the footer
*/
export const drawCard = (canvas, film, images, domain = 'cinema.aditakbars.com') => {
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

    // Brand + date pill (just below Instagram's top bar)
    ctx.font = `400 40px ${SIGN}`;
    ctx.fillStyle = C.edge; ctx.fillText("ADIT'S CINEMA", 83, 283);
    ctx.fillStyle = C.yellow; ctx.fillText("ADIT'S CINEMA", 80, 280);
    if (film.watched) {
        ctx.font = `800 24px ${BODY}`;
        const label = `DIARY · ${shortDate(film.watched)}`;
        const tw = [...label].reduce((s, ch) => s + ctx.measureText(ch).width + 3.4, -3.4);
        const px = W - 80 - tw - 32;
        ctx.fillStyle = C.edge; ctx.fillRect(px - 4, 238, tw + 40, 56);
        ctx.fillStyle = C.red; ctx.fillRect(px, 242, tw + 32, 48);
        ctx.fillStyle = C.paper; spaced(ctx, label, px + 16, 275, 3.4);
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
    if (!noReview) {
        // The review, on a cream panel, as big as it can be
        const PX = 80; const PW = W - 160 - 10; const PAD = 38;
        const room = FOOT_Y - 60 - y - PAD * 2;
        const quote = fit(ctx, `“${film.review.trim()}”`, {
            font: (s) => `${s >= 52 ? 800 : 600} ${s}px ${BODY}`, max: 72, min: 30, width: PW - PAD * 2, height: room, lineHeight: 1.3,
        });
        const PH = quote.lines.length * quote.size * 1.3 + PAD * 2 - quote.size * 0.25;
        ctx.fillStyle = C.red; ctx.fillRect(PX + 10, y + 10, PW, PH);
        ctx.fillStyle = C.edge; ctx.fillRect(PX - 6, y - 6, PW + 12, PH + 12);
        ctx.fillStyle = C.panel; ctx.fillRect(PX, y, PW, PH);
        ctx.font = `${quote.size >= 52 ? 800 : 600} ${quote.size}px ${BODY}`; ctx.fillStyle = C.panelInk;
        quote.lines.forEach((line, i) => ctx.fillText(line, PX + PAD, y + PAD + quote.size * 0.95 + i * quote.size * 1.3));
    } else if (film.watched) {
        ctx.font = `600 34px ${BODY}`; ctx.fillStyle = C.ink2;
        ctx.fillText(`Watched ${longDate(film.watched)}`, 80, y + 10);
    }

    // Footer, just above Instagram's reply box
    ctx.font = `800 26px ${BODY}`; ctx.fillStyle = C.muted;
    spaced(ctx, "ADIT'S DIARY", 80, FOOT_Y, 2.6);
    ctx.font = `800 30px ${BODY}`; ctx.fillStyle = C.yellow;
    ctx.textAlign = 'right'; ctx.fillText(domain, W - 80, FOOT_Y); ctx.textAlign = 'left';
};

export const fileName = (film) => `adits-cinema-${film.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}${film.watched ? `-${film.watched}` : ''}.png`;
