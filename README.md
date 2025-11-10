# Hypatia - Group Theory Tutor

A Socratic math tutor that teaches abstract algebra through a dancing robot visualization. Makes scary group theory accessible to kids by turning it into concrete, visual dance moves.

![Hypatia Demo](demo.gif)

## What is This?

Hypatia teaches **real group theory** using proper mathematical notation (generators, inverses, relations) but makes it tangible through visualization:

- **a** = step left (the generator)
- **a⁻¹** = step right (the inverse)
- **s** = spin 180° (reflection in dihedral group)

Students see abstract algebraic concepts come alive as a robot dances on a number line.

## Problem Types

### 1. Simplification (ℤ group)
"Let G = ℤ be the group of integers under addition, with generator a. Simplify: aaa(a⁻¹)(a⁻¹)"

### 2. Element Equality
"In the group ℤ with generator a, are aa(a⁻¹) and a equal as group elements?"

### 3. Non-commutativity (Dihedral group)
"Let G = ⟨a, s | s² = e, sas = a⁻¹⟩ be the dihedral group. Show that as ≠ sa"

### 4. Palindromes & Symmetry
"In the group ℤ with generator a, is the word aa⁻¹aa⁻¹ a palindrome?"

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
  - `components/GroupTheoryScene.jsx` - Three.js dancing robot on number line
  - `components/ChatInterface.jsx` - Socratic dialogue with Claude API + system prompt
  - `components/PythagoreanScene.jsx` - Legacy 3D visualization
  - `App.jsx` - Main app with layout
- `server.js` - Express API server for Claude integration

## Key Features

- ✅ **Real group theory notation** - Uses proper mathematical language (ℤ, ⟨a, s | ...⟩, etc.)
- ✅ **Socratic teaching** - Asks questions, waits for predictions, guides discovery
- ✅ **Visual animations** - Robot dances through each step in real-time
- ✅ **Formal problem statements** - Questions phrased like actual textbook problems
- ✅ **Interactive learning** - Students work through step-by-step with immediate feedback
- ✅ **Multiple group types** - Cyclic groups (ℤ), dihedral groups (non-commutative)

## Teaching Philosophy

Hypatia follows strict Socratic principles:
- **Predict first, verify second** - Students commit to answers before seeing animations
- **Bite-sized conversations** - 1-3 sentences per message, rapid back-and-forth
- **Guide, don't give** - Leads students to discover concepts themselves
- **Interleaved animations** - Robot moves AS concepts are discussed, not in batches

## Technical Details

**Animation System:**
- Custom event-based animation triggers via `window.dispatchEvent`
- Tags: `<animate>X</animate>` for movements, `<reset>` to return to origin
- Notation parser converts Unicode a⁻¹ to internal representation
- Three.js renders robot with orientation signs (a/a⁻¹) for dihedral group

**System Prompt:**
The entire teaching strategy is encoded in a ~500 line system prompt in `ChatInterface.jsx` that includes:
- Group theory definitions and relations
- Animation rules and timing
- Socratic teaching patterns
- Example interactions
- Error handling strategies






