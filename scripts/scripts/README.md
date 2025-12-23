# Program Docs Generator v2.0

A SOLID-compliant documentation generator that converts academic program files into beautiful Docusaurus-compatible MDX documentation.

## ✨ Features

- **Multi-format support** - MATLAB, LaTeX, PDF, HTML, Jupyter Notebooks, Text
- **Auto-categorization** - Groups files by chapter and program ID
- **Watch mode** - Auto-regenerate on file changes
- **Sidebar generation** - Auto-generates Docusaurus sidebar config
- **Fully testable** - Comprehensive unit tests with 80%+ coverage
- **SOLID principles** - Clean, maintainable, extensible architecture

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run generation
npm start

# Watch mode (auto-regenerate)
npm run watch

# Clean generated files
npm run clean

# Run tests
npm test
```

## 📁 File Naming Convention

Files must follow the pattern: `Chapt<N><Type><#><variant>.<ext>`

| Pattern | Example | Result |
|---------|---------|--------|
| Basic | `Chapt1Exercise8.m` | Chapter 1, Exercise 8 |
| Figure | `Chapt2Fig3.pdf` | Chapter 2, Figure 3 |
| Variant | `Chapt3Exercise5a.tex` | Chapter 3, Exercise 5A |

## 📂 Supported File Types

| Extension | Type | Description |
|-----------|------|-------------|
| `.m` | MATLAB | Source code with syntax highlighting |
| `.tex` | LaTeX | Document source with preview |
| `.pdf` | PDF | Embedded PDF viewer |
| `.html` | HTML | Live preview with source |
| `.ipynb` | Jupyter | Notebook with Colab/nbviewer links |
| `.txt` | Text | Plain text display |

## 🏗️ Architecture

```
src/
├── config/           # Configuration & file types
├── utils/            # Pure utility functions
│   ├── stringUtils   # String manipulation
│   ├── fileSystem    # FS abstraction layer
│   └── logger        # Logging utilities
├── parsers/          # Input processing
│   ├── programParser # Filename parsing
│   └── fileClassifier# File type classification
├── generators/       # Output generation
│   ├── templateBuilder# MDX components
│   ├── pageGenerators # Page strategies
│   └── sidebarGenerator# Sidebar config
├── services/         # Business logic
│   ├── documentProcessor# Main orchestrator
│   ├── cleanService  # Cleanup operations
│   └── watchService  # File watching
├── app.js            # DI container
└── index.js          # CLI entry point
```

## 💎 SOLID Principles

### Single Responsibility
Each module has one reason to change:
- Parsers only parse
- Generators only generate
- Services only orchestrate

### Open/Closed
New file types can be added without modifying existing code:
```javascript
registerFileType('.py', { type: 'python', ... });
factory.registerGenerator('python', new PythonGenerator());
```

### Liskov Substitution
All page generators implement the same interface and can be used interchangeably.

### Interface Segregation
Small, focused interfaces. FileSystem only exposes needed operations.

### Dependency Inversion
Services receive dependencies via injection:
```javascript
const processor = createDocumentProcessor({
  fileSystem,      // Injected
  programParser,   // Injected
  generatorFactory,// Injected
});
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test Structure
```
tests/
├── testUtils.js              # Mock factories
├── utils/
│   └── stringUtils.test.js
├── parsers/
│   ├── programParser.test.js
│   └── fileClassifier.test.js
├── generators/
│   ├── templateBuilder.test.js
│   └── pageGenerators.test.js
└── services/
    └── documentProcessor.test.js
```

## 📖 Documentation

Open `docs/index.html` in your browser for full API documentation with interactive sidebar navigation.

## 🔧 Configuration

Create custom configuration:
```javascript
const { createApplication } = require('./src/app');

const app = createApplication({
  config: {
    baseDir: '/path/to/project',
    viewerBaseUrl: 'https://viewer.example.com',
    githubRawBase: 'raw.githubusercontent.com/user/repo/main',
  },
});

app.run();
```

## 📝 License

MIT
