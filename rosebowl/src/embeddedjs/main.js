/**
 * CroninTech Analog Watchface
 * Pebble 2 Emery (200x228) — Alloy / Poco
 *
 * Layout:
 *  - Dark navy background
 *  - 12 hour tick marks (4 large at cardinal positions, 8 smaller)
 *  - Center logo image (bitmap resource) drawn centered on the face
 *  - Thin hour, minute, and second hands
 *  - Date window at 3 o'clock
 *
 * To swap in your logo:
 *  1. Replace resources/logo_placeholder.png with your image.
 *     Recommended: PNG, 64-color palettized, ideally with transparency.
 *     Size: any — it will be centered. 80x80 works well for this layout.
 *  2. Keep the filename "logo_placeholder.png" OR update both:
 *       - the "file" path in package.json media array
 *       - the Resource() call below to match your new filename.
 */

import Poco from "commodetto/Poco";
import readPNG from "commodetto/readPNG";

const render = new Poco(screen);

// ─── Display dimensions ───────────────────────────────────────────────────────
const W  = render.width;   // 200
const H  = render.height;  // 228
const CX = W / 2;          // center x = 100
const CY = H / 2;          // center y = 114

// ─── Load center logo bitmap ──────────────────────────────────────────────────
// readPNG loads the PNG resource declared in package.json at startup.
// The image is decoded once and cached — no per-frame allocation.
//
// If your image is a JPEG instead:
//   import JPEG from "commodetto/readJPEG";
//   const logo = JPEG.decompress(new Resource("logo.jpg"));
//
// If your image is a BMP:
//   import parseBMP from "commodetto/parseBMP";
//   const logo = parseBMP(new Resource("logo.bmp"));
const logo = readPNG(new Resource("logo_placeholder.png"));

// Pre-compute draw position once (centered on face)
const LOGO_X = Math.round(CX - logo.width  / 2);
const LOGO_Y = Math.round(CY - logo.height / 2);

// ─── Fonts ────────────────────────────────────────────────────────────────────
const dateFont = new render.Font("Gothic-Bold", 11);

// ─── Colors ───────────────────────────────────────────────────────────────────
const bgColor       = render.makeColor(13,  15,  20);   // #0d0f14 dark navy
const faceRingColor = render.makeColor(42,  46,  58);   // #2a2e3a subtle ring
const markerMain    = render.makeColor(232, 224, 208);  // warm white (12/3/6/9)
const markerMinor   = render.makeColor(100, 100, 110);  // subtle minor tick marks
const hourHandColor = render.makeColor(232, 224, 208);  // warm white
const minHandColor  = render.makeColor(232, 224, 208);  // warm white
const secHandColor  = render.makeColor(224,  53,  53);  // #e03535 red
const dateTextColor = render.makeColor(232, 224, 208);  // warm white
const dateBgColor   = render.makeColor(26,  30,  42);   // #1a1e2a dark box
const pivotColor    = render.makeColor(200, 184, 122);  // #c8b87a gold

// ─── Geometry ─────────────────────────────────────────────────────────────────
const FACE_RADIUS = 94;  // outer tick ring radius (px)
const HAND_H_LEN  = 55;  // hour hand tip reach
const HAND_H_TAIL = 10;  // hour hand counterbalance length
const HAND_M_LEN  = 72;  // minute hand tip reach
const HAND_M_TAIL = 12;  // minute hand counterbalance length
const HAND_S_LEN  = 80;  // second hand tip reach
const HAND_S_TAIL = 18;  // second hand counterbalance length

// ─── Drawing helpers ──────────────────────────────────────────────────────────

/**
 * Convert clock polar coords to pixel {x, y}.
 * angleDeg: 0 = 12 o'clock, increases clockwise.
 */
function polar(cx, cy, r, angleDeg) {
    const rad = (angleDeg - 90) * Math.PI / 180;
    return {
        x: Math.round(cx + r * Math.cos(rad)),
        y: Math.round(cy + r * Math.sin(rad)),
    };
}

/**
 * Draw a line with a given pixel thickness by stacking offset parallel lines.
 * thickness=1 uses a single render.drawLine call with no math overhead.
 */
function drawLine(color, x1, y1, x2, y2, thickness) {
    if (thickness <= 1) {
        render.drawLine(color, x1, y1, x2, y2);
        return;
    }
    const dx   = x2 - x1;
    const dy   = y2 - y1;
    const len  = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return;
    const px   = -dy / len;
    const py   =  dx / len;
    const half = Math.floor(thickness / 2);
    for (let i = -half; i <= half; i++) {
        const ox = Math.round(px * i);
        const oy = Math.round(py * i);
        render.drawLine(color, x1 + ox, y1 + oy, x2 + ox, y2 + oy);
    }
}

/** Draw one watch hand with a short counterbalance tail at the opposite end */
function drawHand(color, angleDeg, length, tailLength, thickness) {
    const tip  = polar(CX, CY, length,     angleDeg);
    const tail = polar(CX, CY, tailLength, angleDeg + 180);
    drawLine(color, tail.x, tail.y, tip.x, tip.y, thickness);
}

// ─── Face elements ────────────────────────────────────────────────────────────

/** Draw the outer decorative ring */
function drawRing() {
    const steps = 72;
    for (let i = 0; i < steps; i++) {
        const a1 = (360 / steps) * i;
        const a2 = (360 / steps) * (i + 1);
        const p1 = polar(CX, CY, FACE_RADIUS, a1);
        const p2 = polar(CX, CY, FACE_RADIUS, a2);
        render.drawLine(faceRingColor, p1.x, p1.y, p2.x, p2.y);
    }
}

/** Draw 12 hour tick marks */
function drawTicks() {
    for (let i = 0; i < 12; i++) {
        const angle      = i * 30;
        const isCardinal = (i % 3 === 0);
        const outerR     = FACE_RADIUS - 2;
        const innerR     = isCardinal ? outerR - 12 : outerR - 8;
        const tickW      = isCardinal ? 4 : 2;
        const color      = isCardinal ? markerMain : markerMinor;
        const outer      = polar(CX, CY, outerR, angle);
        const inner      = polar(CX, CY, innerR, angle);
        drawLine(color, inner.x, inner.y, outer.x, outer.y, tickW);
    }
}

/** Draw the logo bitmap centered on the watch face */
function drawLogo() {
    render.drawBitmap(logo, LOGO_X, LOGO_Y);
}

/** Date window at the 3 o'clock position */
function drawDate(now) {
    const day  = String(now.getDate()).padStart(2, "0");
    const boxW = 22;
    const boxH = 16;
    const boxX = Math.round(CX + 42);
    const boxY = Math.round(CY - boxH / 2);

    render.fillRectangle(dateBgColor, boxX, boxY, boxW, boxH);

    const tw = render.getTextWidth(day, dateFont);
    render.drawText(
        day, dateFont, dateTextColor,
        Math.round(boxX + (boxW - tw) / 2),
        Math.round(boxY + (boxH - dateFont.height) / 2)
    );
}

/** Tiny gold pivot pin drawn on top of all hands */
function drawPivot() {
    render.fillRectangle(pivotColor, CX - 2, CY - 2, 4, 4);
}

// ─── Main draw ────────────────────────────────────────────────────────────────

function draw(event) {
    const now     = event.date;
    const hours   = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // Smooth (non-stepping) hand angles
    const secAngle  = seconds * 6;
    const minAngle  = minutes * 6  + seconds * 0.1;
    const hourAngle = hours   * 30 + minutes * 0.5;

    render.begin();

    // Draw order: back → front
    render.fillRectangle(bgColor, 0, 0, W, H);  // 1. background
    drawRing();                                   // 2. outer ring
    drawTicks();                                  // 3. hour markers
    drawLogo();                                   // 4. center bitmap
    drawDate(now);                                // 5. date window
    drawHand(hourHandColor, hourAngle, HAND_H_LEN, HAND_H_TAIL, 3);  // 6. hour
    drawHand(minHandColor,  minAngle,  HAND_M_LEN, HAND_M_TAIL, 2);  // 7. minute
    drawHand(secHandColor,  secAngle,  HAND_S_LEN, HAND_S_TAIL, 1);  // 8. second
    drawPivot();                                  // 9. pivot pin (topmost)

    render.end();
}

// ─── Event listener ───────────────────────────────────────────────────────────
// "secondchange" → second hand animates, higher battery use.
// Switch to "minutechange" to remove seconds and save power.
watch.addEventListener("secondchange", draw);