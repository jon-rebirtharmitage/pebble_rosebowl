/**
 * CroninTech Analog Watchface
 * Pebble 2 Emery (200x228) — Alloy / Poco
 *
 * Correct Pebble Poco API signatures used throughout:
 *   render.drawLine(x1, y1, x2, y2, color, thickness)
 *   render.fillRectangle(color, x, y, w, h)
 *   render.drawText(str, font, color, x, y)
 *   render.drawCircle(color, cx, cy, r, startDeg, endDeg)
 */

import Poco from "commodetto/Poco";

const render = new Poco(screen);

// ── Background bitmap (logo.png, resource ID 1) ───────────────────────────────
const bg = new Poco.PebbleBitmap(1);

// ── Dimensions ────────────────────────────────────────────────────────────────
const W  = render.width;   // 200
const H  = render.height;  // 228
const CX = W / 2;          // 100
const CY = H / 2;          // 114

// ── Fonts ─────────────────────────────────────────────────────────────────────
const dateFont = new render.Font("Gothic-Bold", 18);

// ── Colors ────────────────────────────────────────────────────────────────────
const faceRingColor = render.makeColor(42,  46,  58);
const markerMain    = render.makeColor(232, 224, 208);
const markerMinor   = render.makeColor(100, 100, 110);
const hourHandColor = render.makeColor(232, 224, 208);
const minHandColor  = render.makeColor(232, 224, 208);
const secHandColor  = render.makeColor(224,  53,  53);
const dateTextColor = render.makeColor(232, 224, 208);
const dateBgColor   = render.makeColor(26,  30,  42);
const pivotColor    = render.makeColor(200, 184, 122);

// ── Geometry ──────────────────────────────────────────────────────────────────
const FACE_RADIUS = 94;
const HAND_H_LEN  = 55;
const HAND_H_TAIL = 10;
const HAND_M_LEN  = 72;
const HAND_M_TAIL = 12;
const HAND_S_LEN  = 80;
const HAND_S_TAIL = 18;

// ── Helpers ───────────────────────────────────────────────────────────────────

function polar(r, deg) {
    const rad = (deg - 90) * Math.PI / 180;
    return {
        x: Math.round(CX + r * Math.cos(rad)),
        y: Math.round(CY + r * Math.sin(rad)),
    };
}

// Correct signature: render.drawLine(x1, y1, x2, y2, color, thickness)
function thickLine(color, x1, y1, x2, y2, t) {
    render.drawLine(x1, y1, x2, y2, color, t);
}

function drawHand(color, deg, len, tail, thickness) {
    const tip  = polar(len,  deg);
    const back = polar(tail, deg + 180);
    render.drawLine(back.x, back.y, tip.x, tip.y, color, thickness);
}

// ── Face elements ─────────────────────────────────────────────────────────────

function drawRing() {
    for (let i = 0; i < 72; i++) {
        const p1 = polar(FACE_RADIUS, i * 5);
        const p2 = polar(FACE_RADIUS, (i + 1) * 5);
        render.drawLine(p1.x, p1.y, p2.x, p2.y, faceRingColor, 1);
    }
}

function drawTicks() {
    for (let i = 0; i < 12; i++) {
        const deg    = i * 30;
        const isC    = (i % 3 === 0);
        const outerR = FACE_RADIUS - 2;
        const innerR = isC ? outerR - 12 : outerR - 8;
        const outer  = polar(outerR, deg);
        const inner  = polar(innerR, deg);
        render.drawLine(inner.x, inner.y, outer.x, outer.y,
                        isC ? markerMain : markerMinor,
                        isC ? 4 : 2);
    }
}

function drawDate(now) {
    const day = String(now.getDate()).padStart(2, "0");
    const bW = 22, bH = 16;
    const bX = Math.round(CX + 42);
    const bY = Math.round(CY - bH / 2);
    render.fillRectangle(dateBgColor, bX, bY, bW, bH);
    const tw = render.getTextWidth(day, dateFont);
    render.drawText(day, dateFont, dateTextColor,
        Math.round(bX + (bW - tw) / 2),
        Math.round(bY + (bH - dateFont.height) / 2));
}

// ── Main draw ─────────────────────────────────────────────────────────────────

function draw(event) {
    const now     = event.date;
    const hours   = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const hourAngle = hours * 30 + minutes * 0.5;
    const minAngle  = minutes * 6 + seconds * 0.1;
    const secAngle  = seconds * 6;

    render.begin();

    render.drawBitmap(bg, 0, 0);

    drawRing();
    drawTicks();
    drawDate(now);

    drawHand(hourHandColor, hourAngle, HAND_H_LEN, HAND_H_TAIL, 4);
    drawHand(minHandColor,  minAngle,  HAND_M_LEN, HAND_M_TAIL, 3);
    drawHand(secHandColor,  secAngle,  HAND_S_LEN, HAND_S_TAIL, 1);

    // Center pivot dot
    render.drawCircle(pivotColor, CX, CY, 4, 0, 360);

    render.end();
}

// ── Start ─────────────────────────────────────────────────────────────────────
// minutechange fires immediately on registration → first draw right away
watch.addEventListener("minutechange", draw);