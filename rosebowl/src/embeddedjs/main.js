/**
 * CroninTech Analog Watchface
 * Pebble 2 Emery (200x228) — Alloy / Poco
 *
 * Pebble Poco API signatures:
 *   render.drawLine(x1, y1, x2, y2, color, thickness)
 *   render.fillRectangle(color, x, y, w, h)
 *   render.drawText(str, font, color, x, y)
 *   render.drawCircle(color, cx, cy, r, startDeg, endDeg)
 */

import Poco from "commodetto/Poco";

const render = new Poco(screen);

// ── Background bitmap (logo.png, resource ID 1) ────────────────────────────
const bg = new Poco.PebbleBitmap(1);

// ── Dimensions ────────────────────────────────────────────────────────────
const W  = render.width;   // 200
const H  = render.height;  // 228
const CX = W / 2;          // 100
const CY = H / 2;          // 114

// ── Fonts ──────────────────────────────────────────────────────────────────
const numFont  = new render.Font("Gothic-Bold", 14);   // hour numbers
const dateFont = new render.Font("Gothic-Bold", 14);   // date window

// ── Colors ─────────────────────────────────────────────────────────────────
const black         = render.makeColor(0,   0,   0);
const white         = render.makeColor(255, 255, 255);
const faceRingColor = render.makeColor(0,   0,   0);   // black ring
const markerColor   = render.makeColor(0,   0,   0);   // black ticks
const hourHandColor = render.makeColor(0,   0,   0);   // black
const minHandColor  = render.makeColor(0,   0,   0);   // black
const secHandColor  = render.makeColor(200, 0,   0);   // red second hand
const numColor      = render.makeColor(0,   0,   0);   // black numbers
const dateTextColor = render.makeColor(0,   0,   0);
const dateBgColor   = render.makeColor(255, 255, 255); // white date box
const pivotColor    = render.makeColor(0,   0,   0);   // black pivot

// ── Geometry ──────────────────────────────────────────────────────────────
const FACE_RADIUS = 90;   // outer ring
const NUM_RADIUS  = 74;   // where number centres sit (inside tick ring)
const HAND_H_LEN  = 52;
const HAND_H_TAIL = 10;
const HAND_M_LEN  = 70;
const HAND_M_TAIL = 12;
const HAND_S_LEN  = 78;
const HAND_S_TAIL = 16;

// ── Helpers ───────────────────────────────────────────────────────────────

function polar(r, deg) {
    const rad = (deg - 90) * Math.PI / 180;
    return {
        x: Math.round(CX + r * Math.cos(rad)),
        y: Math.round(CY + r * Math.sin(rad)),
    };
}

function drawHand(color, deg, len, tail, thickness) {
    const tip  = polar(len,  deg);
    const back = polar(tail, deg + 180);
    render.drawLine(back.x, back.y, tip.x, tip.y, color, thickness);
}

// ── Face elements ──────────────────────────────────────────────────────────

function drawRing() {
    // Two concentric rings for a clean bezel look
    for (let i = 0; i < 72; i++) {
        const p1 = polar(FACE_RADIUS,     i * 5);
        const p2 = polar(FACE_RADIUS,     (i + 1) * 5);
        const q1 = polar(FACE_RADIUS - 3, i * 5);
        const q2 = polar(FACE_RADIUS - 3, (i + 1) * 5);
        render.drawLine(p1.x, p1.y, p2.x, p2.y, faceRingColor, 1);
        render.drawLine(q1.x, q1.y, q2.x, q2.y, faceRingColor, 1);
    }
}

function drawTicks() {
    for (let i = 0; i < 12; i++) {
        const deg    = i * 30;
        const isC    = (i % 3 === 0);
        const outerR = FACE_RADIUS - 4;
        const innerR = isC ? outerR - 10 : outerR - 6;
        const outer  = polar(outerR, deg);
        const inner  = polar(innerR, deg);
        render.drawLine(inner.x, inner.y, outer.x, outer.y,
                        markerColor, isC ? 3 : 2);
    }
}

function drawNumbers() {
    const labels = ["12","1","2","3","4","5","6","7","8","9","10","11"];
    for (let i = 0; i < 12; i++) {
        const deg  = i * 30;
        const pos  = polar(NUM_RADIUS, deg);
        const str  = labels[i];
        const tw   = render.getTextWidth(str, numFont);
        const tx   = Math.round(pos.x - tw / 2);
        const ty   = Math.round(pos.y - numFont.height / 2);
        render.drawText(str, numFont, numColor, tx, ty);
    }
}

function drawDate(now) {
    const day = String(now.getDate()).padStart(2, "0");
    const bW = 24, bH = 15;
    // Position at 3 o'clock, between number and center
    const bX = Math.round(CX + 36);
    const bY = Math.round(CY - bH / 2);
    render.fillRectangle(dateBgColor, bX, bY, bW, bH);
    // Thin black border
    render.drawLine(bX,        bY,        bX + bW,   bY,        black, 1);
    render.drawLine(bX,        bY + bH,   bX + bW,   bY + bH,   black, 1);
    render.drawLine(bX,        bY,        bX,        bY + bH,   black, 1);
    render.drawLine(bX + bW,   bY,        bX + bW,   bY + bH,   black, 1);
    const tw = render.getTextWidth(day, dateFont);
    render.drawText(day, dateFont, dateTextColor,
        Math.round(bX + (bW - tw) / 2),
        Math.round(bY + (bH - dateFont.height) / 2));
}

// ── Main draw ─────────────────────────────────────────────────────────────

function draw(event) {
    const now     = event.date;
    const hours   = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const hourAngle = hours * 30 + minutes * 0.5;
    const minAngle  = minutes * 6 + seconds * 0.1;
    const secAngle  = seconds * 6;

    render.begin();

    // 1. Background image
    render.drawBitmap(bg, 0, 0);

    // 2. Dial chrome
    drawRing();
    drawTicks();
    drawNumbers();

    // 3. Date
    drawDate(now);

    // 4. Hands (hour → minute → second, each on top)
    drawHand(hourHandColor, hourAngle, HAND_H_LEN, HAND_H_TAIL, 5);
    drawHand(minHandColor,  minAngle,  HAND_M_LEN, HAND_M_TAIL, 3);
    drawHand(secHandColor,  secAngle,  HAND_S_LEN, HAND_S_TAIL, 1);

    // 5. Center pivot
    render.drawCircle(pivotColor, CX, CY, 4, 0, 360);

    render.end();
}

// ── Start ─────────────────────────────────────────────────────────────────
// minutechange fires immediately on registration → first draw right away
watch.addEventListener("minutechange", draw);