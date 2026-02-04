# Red-Black Tree Visualiser

An interactive web-based visualizer for Red-Black Trees, designed to help students and developers understand the complex operations and rotations that maintain tree balance. This educational tool provides step-by-step animations, pseudocode explanations, and memory representations.

## Features

### Core Functionality
- **Interactive Tree Operations**
  - Insert nodes with animated step-by-step visualization
  - Delete nodes with detailed balancing operations
  - Find/search for specific nodes in the tree
  - Bulk insert random nodes for testing

### Visualization Features
- **Step-by-Step Animation**: Navigate through each operation step with playback controls
- **Tree Canvas**: Interactive D3-powered tree visualization with color-coded nodes (red/black)
- **Memory Grid**: Visual representation of node memory addresses (0-255)
- **Pseudocode Panel**: Synchronized pseudocode highlighting for each operation step
- **Node Inspector**: Detailed view of selected node properties (key, color, parent, children, memory address)
- **Explanation Box**: Real-time descriptions of what's happening at each step

### User Experience
- **Drag & Drop Panels**: Customizable layout with sortable widgets
- **Dark/Light Mode**: Theme toggle for comfortable viewing
- **Keyboard Controls**: Navigate steps with arrow keys, spacebar to play/pause
- **Player Controls**: Play, pause, step forward/backward, jump to start/end
- **Adjustable Speed**: Control animation playback speed
- **View Options**: Toggle visibility of memory grid, pseudocode, and explanations

## Tech Stack

### Frontend Framework & Libraries
- **React 19** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server

### Visualization & Animation
- **D3.js** - Tree rendering and SVG manipulation
- **Framer Motion** - Smooth animations and transitions
- **@dnd-kit** - Drag and drop functionality for panels

### UI Components & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible UI primitives (tabs, switches, labels, etc.)
- **Lucide React** - Icon library
- **class-variance-authority** - Component variant management

### Development Tools
- **ESLint** - Code linting
- **Jest** - Testing framework
- **PostCSS** - CSS processing

## Prerequisites

Before running this project, make sure you have:
- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager

## Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/connordonne/red-black-tree-visualiser.git
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

## Development Commands

```bash
# Start development server with hot module replacement
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run linter
npm run lint

# Run tests
npm run test
```

## Project Structure

```
red-black-tree-visualiser/
├── public/                 # Static assets
│   └── uofg-crest.png     # University of Glasgow branding
├── src/
│   ├── components/        # React components
│   │   ├── Controls.tsx           # Operation input controls
│   │   ├── TreeCanvas.tsx         # D3 tree visualization
│   │   ├── PlayerControls.tsx     # Animation playback controls
│   │   ├── PseudocodePanel.tsx    # Code explanation panel
│   │   ├── MemoryGrid.tsx         # Memory address grid
│   │   ├── NodeInspector.tsx      # Selected node details
│   │   ├── ExplanationBox.tsx     # Step descriptions
│   │   ├── ViewOptions.tsx        # UI configuration
│   │   └── ui/                    # Reusable UI components
│   ├── core/
│   │   └── RedBlackTree.ts        # Red-Black Tree implementation
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions and pseudocode data
│   ├── App.tsx            # Main application component
│   ├── RedBlackTreeVisualiser.tsx  # Main visualizer component
│   └── main.tsx           # Application entry point
├── index.html             # HTML entry point
├── package.json           # Project dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── tailwind.config.cjs    # Tailwind CSS configuration
```

## How It Works

1. **Select an Operation**: Choose insert, delete, or find from the controls panel
2. **Enter a Value**: Provide the node key you want to operate on
3. **Watch the Animation**: The visualizer will step through the operation, showing:
   - Tree structure changes with highlighted nodes
   - Pseudocode execution with line highlighting
   - Memory address representations
   - Detailed explanations of each step
4. **Control Playback**: Use player controls to navigate, pause, or adjust speed
5. **Inspect Nodes**: Click on nodes in the memory grid to see detailed information

## Educational Value

This visualizer is particularly useful for:
- Computer Science students learning about balanced binary search trees
- Understanding the complex rotation and recoloring operations in Red-Black Trees
- Visualizing how tree balance is maintained during insertions and deletions
- Comparing theoretical algorithms with actual implementations
- Debugging and understanding Red-Black Tree behavior

## License

This project is developed as an educational tool for the University of Glasgow.

## Acknowledgments

- University of Glasgow Computer Science Department
- Built with modern web technologies for optimal performance and user experience
