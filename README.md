# Borderify 📸

> Frame your photos for Instagram carousels - portrait, landscape, square, etc. - without having your images auto-cropped. Runs entirely on your browser.

---

## The Problem

Instagram's **auto-cropping** is a well-known frustration and problem for photographers. When you upload a carousel post, Instagram forces every subsequent image/slide to match the aspect ratio of the first image. So if your first slide is portrait, your landscape shots get cropped horizontally. If your first slide is landscape, your tall portraits gets cropped vertically.
 
Common camera outputs like 3:2, 2:3, panoramic, and mixed-orientation sets don't map cleanly to Instagram's allowed ratios, and part of the image gets cropped off. Borderify solves this by adding **smart borders** to every photo so nothing gets cropped — regardless of orientation or canvas size.

---
 
## Features
 
### Upload
- Batch upload photos in PNG or JPG format
- Drag-and-drop or file picker from directory supported


### Auto-framing
- Uploaded photos are automatically given borders on import, ready to export immediately with no manual input required
- Borders are calculated so the full image fits within the chosen canvas with no cropping done to the image

### Canvas sizes
Choose the target Instagram format for your post:

| Format | Dimensions | Ratio | Use case |
|--------|------------|-------|----------|
| Portrait | 1080 × 1440 px | 3:4 | Portrait feed posts |
| Landscape | 1080 × 566 px | 1.91:1 | Landscape feed posts |
| Square | 1080 × 1080 px | 1:1 | Standard square posts |

Users are given an option to apply the same format for all uploaded images at once.
 
### Border styles
Customize each photo individually:
- **Solid color:** pick any color for a clean flat border
- **Blurred background:** uses the photo itself, blurred, as the fill (blur strength adjustable)
- **Gradient:** two-color gradient fill
- **Stripes:** patterned stripe fill

Each style has its own parameters that can be modified by the user.

### Image positioning
- Photos snap to center automatically easily and borders stay balanced
- Freely resize (aspect-ratio locked) and reposition the photo within the canvas

### Split mode (landscape ↔ portrait)
When fitting a photo that doesn't match the canvas orientation, choose between two modes:
- **Fit (automatic):** scale the photo to fit entirely within the canvas with borders on all sides
- **Split:** cut the photo down the middle into two separate images, creating a panoramic effect when scrolling through a carousel post on Instagram

### Export
- Export individual photos or download all as a `.zip`
- Output format: **JPEG** at full quality (no compression)
- All processing is client-side; no files are uploaded to a server
---
 
## Tech stack
 
| Layer | Technology |
|-------|------------|
| Framework | React 18 + Vite + TypeScript |
| State management | Zustand |
| Image processing | HTML5 Canvas API |
| Batch export | JSZip (client-side `.zip` bundling) |
| Styling | Tailwind CSS v4 |

--- 

## Project structure
 
```
src/
├── components/
│   ├── UploadScreen.tsx        # Drag-drop and file picker UI
│   ├── EditorScreen.tsx        # Main editor layout
│   ├── PhotoList.tsx           # Scrollable list of uploaded photos
│   ├── CanvasStage.tsx         # Live <canvas> preview
│   ├── ControlsPanel.tsx       # Format selector and adjustments
│   ├── BorderControls.tsx      # Border style, color, size controls
│   └── ExportBar.tsx           # Individual and batch download controls
├── lib/
│   ├── autoLayout.ts           # Auto border calculation on upload
│   ├── geometry.ts             # Fit / split layout math
│   ├── borders.ts              # Background fill strategies
│   ├── render.ts               # Canvas compositing logic
│   ├── presets.ts              # Canvas size presets
│   └── export.ts               # JPEG export + JSZip bundling
├── store.ts                    # Zustand global state
├── types.ts                    # Shared TypeScript types
├── styles.css                  # Global styles
└── main.tsx                    # App entry point
```
---

## How it works
 
1. **Upload:** photos are read into memory via `FileReader` and decoded as `ImageBitmap` objects. Nothing is sent to a server.
2. **Auto-frame:** on load, `dimensionCalc.ts` computes the centered position and border size for each photo relative to the chosen canvas, so every photo is export-ready immediately.
3. **Edit:** the user can adjust border style, color, and size per photo. The canvas re-renders live on every change using the Canvas API.
4. **Split mode:** if split is chosen, `splitImage.ts` renders two canvases from the same source image: the left half and the right half, each framed independently.
5. **Export:** `canvas.toBlob('image/jpeg', 1.0)` converts each canvas to a full-quality JPEG. Single photos download directly; batch exports are bundled into a `.zip` using JSZip and downloaded in one click.
---
 
## Getting started
 
### Prerequisites
 
- Node.js 18+
- npm or yarn
### Installation
 
```bash
# Clone the repo
git clone https://github.com/cuzethan/sjhacks-main
cd sjhacks
 
# Install dependencies
npm install
 
# Start the development server
npm run dev
```
 
The app will automatically open at `http://localhost:5173`.

## Authors
- Brendan Ly
- Ethan Le
- Jason Nguyen



