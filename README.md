# Advanced Dynamic PDF E-book Viewer

A React + Tailwind immersive e-book experience that lets users upload any PDF, extract text client-side, auto-detect chapters, and read in a styled 5x8 flipbook layout.

## Features

- Atmospheric landing cover with glowing canyon-path theme
- Drag-and-drop PDF upload and validation
- Client-side text extraction using `pdfjs-dist`
- Dynamic chapter detection (`CHAPTER X`, `Chapter X`, roman numerals)
- Intelligent pagination into readable 5x8-style page blocks
- Quote detection and centered italic divider formatting
- Glassmorphism chapter sidebar with rapid chapter flip animation
- Keyboard navigation (`←` / `→`) and responsive reading layout
- Loading progress and robust parsing error handling

## Tech Stack

- React (hooks)
- Tailwind CSS
- Lucide React
- pdfjs-dist
- Vite

## Run Locally

```bash
npm install
npm run dev
npm run build
npm run preview
```

App default dev URL: `http://localhost:3000`
