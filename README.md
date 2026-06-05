# Interactive E-book Viewer

A sophisticated, production-ready React application showcasing an atmospheric e-book viewer for "The Art of Understanding: The Journey of Shadow" by Sakshi Patidar.

## Features

✨ **Landing Page**
- Cinematic book cover design with canyon-inspired aesthetics
- Glowing golden pathway with SVG gradients and filters
- Layered metallic gold typography
- Smooth zoom transition to reading view

📖 **Interactive Book Viewer**
- Responsive 5x8 inch paperback display
- Dual-pane layout (responsive to single-pane on mobile)
- Hardware-accelerated 3D page flip animations
- Smooth page navigation with previous/next controls
- Page number indicators

📚 **Chapter Navigation**
- Collapsible glassmorphism sidebar
- Chapter selection with rapid page-flip animation
- Current page tracking
- Mobile-friendly menu toggle

🎨 **Design & Styling**
- Dark charcoal/obsidian backgrounds (#121110, #1a1816)
- Metallic gold accents (#d4af37, #e5c158)
- Warm ivory page textures (#fbf9f3, #fbeee0)
- Premium serif typography (Playfair Display, Merriweather)
- Elegant glow effects and shadows

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will open automatically at `http://localhost:3000`

## Project Structure

```
src/
├── main.jsx           # React DOM entry point
├── App.jsx            # Application wrapper
├── EbookViewer.jsx    # Main e-book viewer component
└── index.css          # Global styles and Tailwind imports
```

## Content

The viewer includes two complete chapters from "The Art of Understanding":

- **Chapter 1**: "Light and Dark Both Live Within You"
- **Chapter 3**: "The Names I Never Questioned"

Content is automatically paginated for optimal readability within the 5x8 book format.

## Technologies

- **React** - UI framework
- **Tailwind CSS** - Styling and responsive design
- **Lucide React** - Icon library
- **Vite** - Build tool and dev server

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Features Detail

### Landing View
- Full-screen book cover with atmospheric design
- Cover text layers: quote, title, subtitle, author
- "BEGIN THE JOURNEY" button with glow effects
- Smooth animation transitions

### Reading View
- Chapter sidebar with glassmorphism styling
- Dual-pane book pages with realistic binding shadow
- Page turn controls with navigation arrows
- Current position tracking
- Rapid page-flip animation when changing chapters
- Responsive design for all screen sizes

## Performance

- CSS 3D transforms for hardware-accelerated animations
- Optimized SVG pathways with efficient gradients
- Smooth 60fps transitions and interactions
- Minimal re-renders with React hooks

## Customization

### Colors
Edit `tailwind.config.js` to customize the color palette:
- `charcoal`: #121110
- `obsidian`: #1a1816
- `gold`: #d4af37
- `gold-light`: #e5c158
- `ivory`: #fbf9f3

### Typography
Modify font preferences in `tailwind.config.js` or `src/index.css`

### Content
Update chapter data in `src/EbookViewer.jsx` to add or modify content

## License

This project showcases the literary work of Sakshi Patidar.

---

Built with 💛 for an immersive reading experience.
