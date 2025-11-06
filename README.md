# Hypatia - Socratic Math Tutor

A math tutor that makes advanced mathematics accessible through Socratic dialogue and 3D visualizations.

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up API key
Create a `.env` file in the root directory:
```
ANTHROPIC_API_KEY=your_api_key_here
```

### 3. Run the project

**Terminal 1 - Start the API server:**
```bash
npm run server
```

**Terminal 2 - Start the Vite dev server:**
```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## Project Structure

- `src/` - React application
  - `components/Scene3D.jsx` - Three.js scene container
  - `components/GlowingCircle.jsx` - 3D circle with particle trail
  - `components/ChatInterface.jsx` - Chat UI with Claude API
- `server.js` - Express API server for Claude integration

## Tonight's MVP

- ✅ Vite + React + Three.js setup
- ✅ 3D scene with glowing circle and particle trail
- ✅ Basic chat interface with Claude API
- ✅ Socratic dialogue about circle rotations in SO(3)




