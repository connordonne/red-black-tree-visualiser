# Red-Black Tree Visualiser

An interactive, web-based visualiser for Red-Black Trees, designed to help students and developers deeply understand the complex operations, recolouring rules, and rotations that maintain tree balance. This educational tool provides step-by-step animations, interactive learning puzzles, live property validation, and memory representations.

## Features

### 🎓 Learning & Interactive Mode (New)
- **Interactive Recolouring**: Pauses during critical operations to ask users to manually fix "Red-Red" conflicts or recolour nodes based on RBT properties.
- **Drag-and-Drop Rotations**: Interactive rotation puzzles requiring users to drag subtrees into their correct logical positions to complete Left and Right rotations.
- **Real-Time Health Monitor**: Live validation of Red-Black Tree rules (e.g., Root property, Red-Red conflicts, Black-Height consistency) with dynamic health scores and warnings.

### 🌳 Core Tree Operations
- **Insert & Delete**: Fully animated operations with detailed, granular steps covering all edge cases, recolouring, and fixup rotations.
- **Find/Search**: Step-by-step traversal highlighting the search path and target comparisons.
- **Bulk Operations**: Rapidly insert multiple random nodes to test complex tree structures.

### 🎨 Advanced Visualisation
- **D3 & Framer Motion Canvas**: Fluid, physics-based animations for node movements, link drawing, and layout recalculations.
- **2-3-4 Isomorphic View**: Toggleable overlay that groups nodes to visually demonstrate the equivalence between Red-Black Trees and 2-3-4 B-trees.
- **Node Highlighting & Linking**: Active pseudocode lines dynamically highlight their corresponding specific nodes (e.g., Parent, Uncle, Grandparent) in the tree.
- **NIL Node Toggling**: Show or hide sentinel NIL leaves to better visualize Black-Height properties.

### 💻 Pseudocode & Memory Inspection
- **Floating Pseudocode HUD**: A draggable, auto-scrolling pseudocode panel with syntax highlighting and line-by-line annotations.
- **Memory Grid**: A 256-byte visual representation of the heap memory map, showing node allocations and pointers.
- **Struct Inspector**: Click any node (or memory address) to view its raw C-style struct data (address, key, colour, and parent/left/right pointers).

### ⚙️ User Experience & Accessibility
- **Customisable Dashboard**: Drag-and-drop widget layout using `@dnd-kit`.
- **Accessibility Options**: Native Color-Blind mode (uses dashed patterns for red nodes) and memory address toggling.
- **Playback Controls**: Play, pause, step forward/backward, and adjust animation speed.
- **Dark/Light Theme**: Fully responsive "Modern IDE" (Dark) and "Digital Textbook" (Light) themes.

---

## Tech Stack

### Frontend Framework & Libraries
- **React 19** – UI framework
- **TypeScript** – Type-safe development
- **Vite** – Fast build tool and development server

### Visualisation & Animation
- **D3.js** – Tree layout math and bounding calculations
- **Framer Motion** – Smooth SVG animations, spring physics, and drag gestures
- **@dnd-kit/core & sortable** – Accessible drag-and-drop functionality for dashboard panels

### UI Components & Styling
- **Tailwind CSS (v4)** – Utility-first CSS framework
- **Radix UI** – Accessible UI primitives (tabs, switches, labels, sliders)
- **Lucide React** – Icon library
- **class-variance-authority** – Component variant management

---

## Local Setup

### Prerequisites
- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/connordonne/red-black-tree-visualiser.git](https://github.com/connordonne/red-black-tree-visualiser.git)  
   cd red-black-tree-visualiser
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

---

## Development Commands

```bash
# Start development server with hot module replacement
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run the linter
npm run lint

# Run tests
npm run test
```

---

## Project Structure

```text
red-black-tree-visualiser/
├── public/                 # Static assets (University branding)
├── src/
│   ├── components/         # React components
│   │   ├── ui/             # Reusable UI primitives (Radix/Tailwind)
│   │   ├── Controls.tsx    # Operation input controls
│   │   ├── TreeCanvas.tsx  # D3/Framer Motion tree SVG rendering
│   │   ├── PlayerControls.tsx # Animation playback scrubber & buttons
│   │   ├── PseudocodePanel.tsx# Draggable code HUD
│   │   ├── MemoryGrid.tsx  # Memory allocation visualisation
│   │   ├── NodeInspector.tsx # Node struct details
│   │   ├── ExplanationBox.tsx # Step descriptions & Health validation
│   │   ├── ViewOptions.tsx # Accessibility & Display toggles
│   │   └── HealthBar.tsx   # Visual indicator for RBT rule violations
│   ├── core/
│   │   └── RedBlackTree.ts # Pure TypeScript RBT implementation & logic
│   ├── hooks/              # Custom React hooks (Player, Layout, D3 Layout)
│   ├── lib/                # Utility functions and pseudocode text
│   ├── types/              # TypeScript interfaces
│   ├── App.tsx             # Main application wrapper
│   └── main.tsx            # Application entry point
├── index.html              
├── package.json            
├── vite.config.ts          
└── tailwind.config.cjs     
```

---

## Educational Value

This visualiser goes beyond simple animation by actively engaging the user. It is particularly useful for:
- **Computer Science Students**: Learning balanced binary search trees through active participation rather than passive watching.
- **Visualising 2-3-4 Equivalency**: Bridging the gap between B-trees and Red-Black Trees using the Isomorphic view.
- **Understanding Memory**: Mapping high-level tree concepts to low-level memory addresses and pointers.
- **Debugging Algorithms**: Testing edge cases in deletion and insertion fixups line-by-line.

---

## Licence

This project is developed as an educational tool for the University of Glasgow.

## Acknowledgements

- **University of Glasgow School of Computing Science**
- Built with modern web technologies for optimal performance and user experience.
