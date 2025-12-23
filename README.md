# Applied Quantum Mechanics - MATLAB Programs Documentation

Interactive documentation for MATLAB programs from **Applied Quantum Mechanics** by A.F.J. Levi.

## About

This repository contains a Docusaurus-based documentation site for all MATLAB programs included with the book "Applied Quantum Mechanics" by A.F.J. Levi. The site provides:

- 📊 Full MATLAB source code with syntax highlighting
- 📥 Direct download links for all programs
- 📚 Organization by chapter and exercise/figure
- 🔍 Easy navigation and search

## Features

- **49 Programs** covering 9 chapters
- **Organized by Chapter**: From Introduction to Statistical Mechanics
- **Interactive Documentation**: Browse code, download files, and view program details
- **Utility Functions**: Includes helper functions used across programs

## Chapters

1. Introduction to Quantum Mechanics
2. Schrödinger Equation
3. Quantum Wells and Barriers
4. Harmonic Oscillator
5. Tunneling and Resonance
6. Density of States
7. Band Structure
8. Perturbation Theory
9. Statistical Mechanics

## Development

This site was built with [Docusaurus](https://docusaurus.io/), a modern static website generator.

### Installation

```bash
npm install
```

### Local Development

```bash
npm start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```bash
npm run build
```

This command generates static content into the `build` directory.

### Deployment

The site is configured for Render.com deployment:

1. Connect your GitHub repository to Render.com
2. The `render.yaml` file contains all deployment configuration
3. Render will automatically build and deploy on every push to master

**Manual deployment** (if needed):
```bash
npm run build
# Upload the build/ folder to your hosting provider
```

## Adding New Programs

1. Place MATLAB files in the `INBOX` folder
2. Run the documentation generator:
   ```bash
   node scripts/generate-program-docs.js
   ```
3. The script will automatically:
   - Parse file names
   - Generate documentation pages
   - Update the sidebar
   - Copy files to static folder

### File Naming Convention

Files should follow this pattern:
- `Chapt<N><Type><#><variant>.m`
- Example: `Chapt1Exercise8.m`, `Chapt2Fig3a.m`

Where:
- `N` = Chapter number (1-9)
- `Type` = Exercise or Fig
- `#` = Number
- `variant` = optional (a, b, c, etc.)

## License

The original MATLAB programs are from "Applied Quantum Mechanics" by A.F.J. Levi.

## Acknowledgments

- **Author**: A.F.J. Levi
- **Book**: Applied Quantum Mechanics
- **Documentation**: Built with Docusaurus
