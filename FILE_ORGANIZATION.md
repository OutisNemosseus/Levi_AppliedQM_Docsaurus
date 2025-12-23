# File Organization & Auto-Categorization Guide

## How It Works

The documentation generator **automatically categorizes files** based on their filename pattern, regardless of file type. Files with the same base name are grouped together as variants of the same program.

## File Naming Pattern

```
Chapt<Chapter><Type><Number><Variant>.<Extension>
```

### Components:
- **Chapter**: 1-9 (chapter number)
- **Type**: `Exercise` or `Fig`
- **Number**: 00-99 (exercise/figure number)
- **Variant**: (optional) a-z, a1-z9, etc.
- **Extension**: `.m`, `.pdf`, `.tex`, `.html`, `.ipynb`, `.txt`

### Examples:

| Filename | Chapter | Type | Number | Variant | Format |
|----------|---------|------|--------|---------|--------|
| `Chapt1Exercise8.m` | 1 | Exercise | 8 | - | MATLAB |
| `Chapt2Fig3a.pdf` | 2 | Fig | 3 | a | PDF |
| `Chapt4Exercise2b.tex` | 4 | Exercise | 2 | b | LaTeX |
| `Chapt7Fig5a1.html` | 7 | Fig | 5 | a1 | HTML |
| `Chapt9Exercise1.ipynb` | 9 | Exercise | 1 | - | Jupyter |

## Multi-Format Programs

Drop multiple file formats for the **same program** into INBOX, and they'll be automatically grouped:

### Example: Chapter 5, Exercise 5

```
INBOX/
├── Chapt5Exercise5.m         ← MATLAB source
├── Chapt5Exercise5.pdf       ← PDF document
├── Chapt5Exercise5.tex       ← LaTeX source
└── Chapt5Exercise5.html      ← HTML visualization
```

### Result:
After running the generator, you get:

```
docs/chapter5/Chapt5Exercise5/
├── index.mdx                 ← Main entry (lists all 4 files)
├── Chapt5Exercise5_matlab.mdx
├── Chapt5Exercise5_pdf.mdx
├── Chapt5Exercise5_latex.mdx
└── Chapt5Exercise5_html.mdx
```

```
static/programs/
├── matlab/Chapt5Exercise5/Chapt5Exercise5.m
├── pdf/Chapt5Exercise5/Chapt5Exercise5.pdf
├── latex/Chapt5Exercise5/Chapt5Exercise5.tex
└── html/Chapt5Exercise5/Chapt5Exercise5.html
```

The sidebar shows **one entry** (Chapt5Exercise5) with **4 file types** available.

## Supported File Types

### 📊 MATLAB (.m)
- Syntax-highlighted code display
- Direct download
- Raw file viewing

### 📝 LaTeX (.tex)
- Source code display
- Syntax highlighting
- Download support
- Auto-truncation for long files

### 📕 PDF (.pdf)
- Embedded PDF viewer (iframe)
- Download option
- Open in new tab option

### 🌐 HTML (.html)
- Live preview in iframe
- Collapsible source code view
- Download & new tab options

### 📓 Jupyter Notebook (.ipynb)
- Download for local use
- Optional nbviewer links
- Optional Google Colab links
- Instructions for viewing

### 📄 Text (.txt)
- Plain text display
- Download & view options

## Workflow

### 1. Add Files to INBOX

```bash
cd docs-site
# Copy your files to INBOX/
cp /path/to/files/*.m INBOX/
cp /path/to/files/*.pdf INBOX/
cp /path/to/files/*.tex INBOX/
```

### 2. Run Generator

```bash
# One-time generation
node scripts/generate-program-docs.js

# Watch mode (auto-regenerate on changes)
node scripts/generate-program-docs.js --watch
```

### 3. View Output

The generator will:
1. ✅ Scan INBOX for supported files
2. ✅ Extract program information from filenames
3. ✅ Group files by programId
4. ✅ Copy files to categorized static folders
5. ✅ Generate MDX documentation pages
6. ✅ Update the sidebar configuration

### 4. Commit & Push

```bash
git add .
git commit -m "Add new program documentation"
git push
```

Render.com will automatically rebuild and deploy!

## Special Features

### Automatic Grouping
Files are grouped by **programId** (everything before the extension):
- `Chapt1Exercise8.m` → programId: `Chapt1Exercise8`
- `Chapt1Exercise8.pdf` → programId: `Chapt1Exercise8`
- Both files appear under **one program** with **2 formats**

### Type-Based Organization
Static files are organized by type for efficient serving:
```
static/programs/
├── matlab/          ← All .m files
├── pdf/             ← All .pdf files
├── latex/           ← All .tex files
├── html/            ← All .html files
├── ipynb/           ← All .ipynb files
└── text/            ← All .txt files
```

### Smart File Detection
The script **automatically detects**:
- File extension → Determines file type
- Base filename → Extracts program info
- Chapter number → Organizes by chapter
- Type & variant → Labels appropriately

### Format-Specific Viewers
Each file type gets an optimized viewer:
- **MATLAB**: Syntax-highlighted code block
- **LaTeX**: Code display with truncation
- **PDF**: Embedded viewer with fallback
- **HTML**: Live iframe preview + source
- **Jupyter**: Download + external viewer links
- **Text**: Simple code block display

## Tips

### Naming Consistency
Always use the **exact same base name** for related files:
```
✅ GOOD:
Chapt1Exercise8.m
Chapt1Exercise8.pdf
Chapt1Exercise8.tex

❌ BAD:
Chapt1Exercise8.m
Chapt1Ex8.pdf          ← Different base name!
Chapter1Exercise8.tex  ← Different pattern!
```

### File Name Validation
Files that don't match the pattern are **skipped**:
```
✅ Valid: Chapt2Fig3a.m
❌ Invalid: Chapter2Figure3a.m
❌ Invalid: ch2ex3.m
❌ Invalid: exercise8.m
```

### Watch Mode
Use watch mode during development:
```bash
node scripts/generate-program-docs.js --watch
```

Then simply drop files into INBOX - the docs regenerate automatically!

### Clean Regeneration
To start fresh:
```bash
# Remove all generated docs
node scripts/generate-program-docs.js --clean

# Regenerate
node scripts/generate-program-docs.js
```

## Example: Adding a New Program

Let's add **Chapter 3, Exercise 10** with multiple formats:

### Step 1: Prepare Files
```
myfiles/
├── Chapt3Exercise10.m       ← MATLAB implementation
├── Chapt3Exercise10.pdf     ← Problem statement
└── Chapt3Exercise10.tex     ← Mathematical derivation
```

### Step 2: Copy to INBOX
```bash
cd docs-site
cp /path/to/myfiles/Chapt3Exercise10.* INBOX/
```

### Step 3: Generate
```bash
node scripts/generate-program-docs.js
```

### Step 4: Output
```
📁 Processing 1 program(s)...

   ✅ Chapt3Exercise10/ 📊📕📝 (3 file(s))

✨ Generation Complete!

   📁 Programs:  1
   📄 Files:     3
```

### Step 5: Result
The sidebar now shows:
```
📚 Programs by Chapter
  └─ Ch 3: Quantum Wells and Barriers
      ├─ Exercise 7
      ├─ Exercise 10  ← New entry!
      └─ Fig 14
```

Clicking "Exercise 10" shows:
- 📊 MATLAB (view code)
- 📕 PDF Document (embedded viewer)
- 📝 LaTeX (view source)

---

**That's it!** The system handles all the categorization, organization, and documentation generation automatically. 🚀
