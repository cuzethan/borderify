# Borderify 📸

> Frame your photos for Instagram carousels - portrait, landscape, square - without having your images auto-cropped. Runs entirely in your browser.

---

## The Problem

Instagram's **auto-cropping** is a well-known frustration for photographers. When you upload a carousel post, Instagram forces every subsequent image to match the aspect ratio of the first. So if your first slide is portrait, your landscape shots get cropped horizontally. If your first slide is landscape, your tall portraits get cropped vertically.

Common camera outputs like 3:2, 2:3, panoramic, and mixed-orientation sets don't map cleanly to Instagram's allowed ratios. Borderify solves this by adding **smart borders** to every photo so nothing gets cropped — regardless of orientation or canvas size.

---
 
## Features
 
### Upload
- Batch upload photos in PNG or JPG format
- Drag-and-drop or file picker supported


### Auto-framing
- Uploaded photos are automatically framed on import, ready to export immediately with no manual input required
- Borders are calculated so the full image fits within the chosen canvas with no cropping

### Canvas sizes
Choose the target Instagram format for your post:

| Format | Dimensions | Ratio | Use case |
|--------|------------|-------|----------|
| Portrait | 1080 × 1350 px | 4:5 | Portrait feed posts |
| Landscape | 1080 × 566 px | 1.91:1 | Landscape feed posts |
| Square | 1080 × 1080 px | 1:1 | Standard square posts |

A single click applies the same format to all uploaded photos at once.
 
### Border styles
Customize each photo individually:
- **Solid color:** pick any color for a clean flat border
- **Blurred background:** uses the photo itself, blurred, as the fill (blur strength adjustable)
- **Gradient:** two-color gradient fill with adjustable angle

Each style has its own parameters that can be modified per photo.

### Image positioning
- Photos snap to center automatically on upload with balanced borders
- Freely resize (aspect-ratio locked) and reposition the photo within the canvas

### Split mode
When fitting a photo that doesn't match the canvas orientation, choose between two modes:
- **Fit (automatic):** scale the photo to fit entirely within the canvas with borders on all sides
- **Split:** cut the photo down the middle into two separate images, creating a panoramic effect when scrolling through an Instagram carousel

### Session saving (optional)
- Sign up or log in to save your editing session to the cloud
- Sessions are restored automatically when you return to the app
- Works without an account — no files are ever uploaded to a server during editing

### Export
- Export individual photos or download all as a `.zip`
- Output format: JPEG at full quality (no compression)
- All image processing is client-side; photos never leave your device

---
 
## Tech stack
 
| Layer | Technology |
|-------|------------|
| Frontend framework | React 18 + Vite + TypeScript |
| Routing | React Router v6 |
| State management | Zustand |
| Image processing | HTML5 Canvas API |
| Batch export | JSZip (client-side `.zip` bundling) |
| Styling | Tailwind CSS v4 |
| Auth & session storage | Supabase |
| Backend API | FastAPI (Python) |
| Media storage | Cloudinary |
| Deployment | Vercel |

--- 

## Project structure

```
borderify/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── UploadScreen.tsx        # Drag-drop / file picker UI
│       │   ├── EditorScreen.tsx        # Main editor layout
│       │   ├── PhotoList.tsx           # Scrollable list of uploaded photos
│       │   ├── CanvasStage.tsx         # Live <canvas> preview
│       │   ├── ControlsPanel.tsx       # Format selector and adjustments
│       │   ├── BorderControls.tsx      # Border style, color, size controls
│       │   └── ExportBar.tsx           # Individual and batch download controls
│       ├── pages/
│       │   ├── LandingPage.tsx         # Marketing / home page
│       │   ├── AppPage.tsx             # App entry point (session restore + routing)
│       │   ├── LoginPage.tsx           # Supabase auth — sign in
│       │   └── SignupPage.tsx          # Supabase auth — create account
│       ├── lib/
│       │   ├── autoLayout.ts           # Auto border calculation on upload
│       │   ├── geometry.ts             # Fit / split layout math
│       │   ├── borders.ts              # Background fill strategies (solid, blurred, gradient)
│       │   ├── render.ts               # Canvas compositing logic
│       │   ├── presets.ts              # Canvas size presets
│       │   └── export.ts               # JPEG export + JSZip bundling
│       ├── store.ts                    # Zustand global state
│       ├── types.ts                    # Shared TypeScript types
│       └── main.tsx                    # App entry point
└── backend/
    └── app/
        ├── api/routes/
        │   ├── photos.py               # Session save / restore endpoints
        │   ├── projects.py             # Project management endpoints
        │   └── system.py               # Health check
        └── core/
            ├── auth.py                 # Supabase token verification
            └── config.py               # Environment config
```

---

## How it works
 
1. **Upload:** photos are decoded as `ImageBitmap` objects directly in the browser. Nothing is sent to a server.
2. **Auto-frame:** on load, `autoLayout.ts` computes the centered position and border size for each photo relative to the chosen canvas preset, so every photo is export-ready immediately.
3. **Edit:** the user can adjust border style, color, and size per photo. The canvas re-renders live on every change using the Canvas API.
4. **Split mode:** if split is chosen, `geometry.ts` renders two canvases from the same source image — the left and right halves — each framed independently.
5. **Session saving:** if logged in, the app sends the current session to the FastAPI backend (which stores images via Cloudinary and metadata via Supabase) and restores it on next visit.
6. **Export:** `canvas.toBlob('image/jpeg', 1.0)` converts each canvas to a full-quality JPEG. Single photos download directly; batch exports are bundled into a `.zip` using JSZip.

---
 
## Getting started

### Prerequisites

- Node.js 18+
- npm
- Python 3.11+ (for the backend)

### Frontend

```bash
git clone https://github.com/cuzethan/sjhacks
cd borderify/frontend

npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### Backend (optional — required for session saving)

```bash
cd borderify/backend

python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

uvicorn app.main:app --reload
```

Copy `.env.example` to `.env` and fill in your Supabase and Cloudinary credentials.

---

## Authors
- Brendan Ly
- Ethan Le
- Jason Nguyen



