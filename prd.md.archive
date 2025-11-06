Product Requirements Doc: Hypatia - Socratic Math Tutor
Named After
Hypatia of Alexandria (c. 360-415 CE) - mathematician, astronomer, and philosopher. She taught using the Socratic method, helping students discover mathematical truths through guided questioning.
Vision
A math tutor that makes advanced mathematics (group theory, topology, 4D geometry) accessible to students by combining Socratic dialogue with intuitive 3D/4D visualizations. Shows that "advanced" math is actually intuitive when you can see it.
Core Philosophy
"Schools teach you what's easy to test. I'll show you what's actually beautiful."
Students can understand group theory, SO(3), hypercubes - they just need the right tools to visualize abstract concepts.

MVP Demo (Tonight - Progress Report)
Problem Input
Pre-loaded question: "How many different ways can you rotate a circle in 3D space?"
Socratic Dialogue
Hypatia asks leading questions:

"What does it mean to rotate something?"
"If you trace a circle in the air, what can you change about it?"
"Can you get from any orientation to any other orientation?"

Primary Visualization: Circle Rotations in SO(3)

3D scene with a glowing circle
Sparkler/firefly traces the circle's path as it moves
Circle rotates through different orientations in 3D space
Shows that the space of all rotations is itself a 3D object (sphere)

Technical approach:

Three.js scene
Animated circle with particle trail
Pre-scripted animation (not interactive for tonight)
Clean, minimal aesthetic


Full Demo (Thursday)
Feature 1: Circle Rotations (Primary)
Same as above but more polished:

Smoother animations
Reference sphere showing "rotation space"
Maybe show the 720° property (if we figure out the firefly direction thing)
Hypatia's questions timed with visual reveals

Feature 2: Hypercube Through Keypad (Stretch Goal)
The Problem: "How can we visualize 4 dimensions using something as simple as a phone keypad?"
The Visualization:

Start with 2×2 keypad (4 points in 2D)
Stack it: 2×2×2 = 8 points (3D cube)
Trace path through the cube over TIME = 4D hypercube!
Show the path as a glowing trail through 4D space

Refinement levels:

2×2 → 2×2×2 (4D via time)
3×3 → 3×3×3 (27 points, denser structure)
Show fractal/hierarchical nature of dimensional stacking

Why this is pedagogically brilliant:

Everyone knows keypads
Dimensional stacking is intuitive
Time as 4th dimension is concrete
Generalizes to arbitrary dimensions

Socratic dialogue:

"What if we had TWO keypads, one on top of the other?"
"Now what if the bottom keypad is 'before' and top is 'after'?"
"We just made a 4D object from something you use every day!"


Technical Architecture
Frontend

React (with Vite or Next.js - your choice)
Three.js (or React Three Fiber)
Tailwind CSS for UI
Vercel AI SDK for Socratic dialogue

Backend

Claude API via Vercel AI SDK
Custom system prompt for Socratic method + group theory

3D Rendering

Three.js for all visualizations
Particle systems for glowing trails
Smooth camera animations
Minimal, clean aesthetic (dark background, glowing elements)


System Prompt
You are Hypatia, named after the ancient mathematician and philosopher. 

Your teaching method:
- NEVER give direct answers
- Ask leading questions that build intuition
- Connect abstract math to physical experience
- Celebrate student insights: "Yes! Exactly!"

You're teaching group theory and topology through visualization:
- SO(3): the space of 3D rotations
- Hypercubes: 4D geometry through dimensional stacking
- These seem abstract but are actually intuitive when visualized

When student struggles:
- Ask simpler questions
- Reference the visualization: "Look at what's happening..."
- Build on what they already know

When student has breakthrough:
- Acknowledge specifically what they figured out
- Connect to bigger picture
- Show them they just understood "advanced" math

Tone: Warm, curious, intellectually rigorous but accessible. You're excited about math and want students to feel that excitement too.

