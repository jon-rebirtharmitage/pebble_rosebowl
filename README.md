# CroninTech Analog Watchface : Rosebowl Hawkeyes

Analog watchface for Pebble 2 Emery (200×228) built with Alloy (Poco renderer).

## Features

- Dark navy background
- 12 tick marks — large at 12/3/6/9, smaller at all others
- Thin analog hands — hour (3px), minute (2px), second (1px red)
- Image logo centered on the face
- Date window at the 3 o'clock position
- Smooth second-hand updates via `secondchange`

## Project Structure

```
cronin-watchface/
├── package.json
└── src/
    └── embeddedjs/
        └── main.js         ← watchface logic (Alloy/Poco)
```

## Build & Install

```bash
# Emulator
pebble build
pebble install --emulator emery

# Physical watch (via Pebble app on phone)
pebble build
pebble install --phone <PHONE_IP>
```

## Customization

All key values are constants near the top of `main.js`:

| Constant        | Default | Description                          |
|-----------------|---------|--------------------------------------|
| `FACE_RADIUS`   | 94      | Outer ring radius (px)               |
| `HAND_H_LEN`    | 55      | Hour hand length                     |
| `HAND_M_LEN`    | 72      | Minute hand length                   |
| `HAND_S_LEN`    | 80      | Second hand length                   |
| `bgColor`       | #0d0f14 | Background — dark navy               |
| `logoColor`     | #5a9aee | Logo primary color — blue            |
| `secHandColor`  | #e03535 | Second hand color — red              |

## Notes

- `secondchange` is used instead of `minutechange` so the second hand animates.
  This uses more battery. Switch to `minutechange` and remove the second hand
  draw calls to extend battery life.
- `render.drawLine()` is used for all hand and tick drawing. The `drawLine()`
  helper adds thickness by drawing parallel 1px lines offset perpendicularly.
- The logo sits slightly above center (logoY = CY - 12) so it reads cleanly
  between the hour and minute hands at rest.
