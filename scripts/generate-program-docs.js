const fs = require('fs');
const path = require('path');

// ============ 配置区域 ============
const CONFIG = {
  // 统一投递箱：所有文件丢这里，脚本自动分类
  INBOX_DIR: path.join(__dirname, '../INBOX'),

  // 目标文件夹：生成的 .mdx 文件位置
  DOCS_OUTPUT_DIR: path.join(__dirname, '../docs'),

  // 静态文件夹：按类型分类存放
  STATIC_OUTPUT_DIR: path.join(__dirname, '../static/programs'),

  // 从文件名提取程序信息的正则表达式
  // Chapt1Exercise8 → chapter=1, type=Exercise, number=8
  // Chapt2Fig3a → chapter=2, type=Fig, number=3, variant=a
  PROGRAM_PATTERN: /^Chapt(\d+)(Exercise|Fig)(\d+)([a-z]\d*)?$/i,

  // 支持的文件扩展名
  SUPPORTED_EXTENSIONS: ['.m', '.txt'],

  // 网站基础 URL - 如果有在线查看器可以设置
  VIEWER_BASE_URL: null,
};

// ============ 文件类型配置 ============
const FILE_TYPES = {
  '.m': {
    type: 'matlab',
    label: 'MATLAB',
    emoji: '📊',
    color: '#0076a8',
    canReadText: true,
    codeLanguage: 'matlab',
  },
  '.txt': {
    type: 'text',
    label: 'Text File',
    emoji: '📄',
    color: '#6b7280',
    canReadText: true,
    codeLanguage: 'text',
  },
};

// ============ 章节名称映射 ============
const CHAPTER_NAMES = {
  '1': 'Introduction to Quantum Mechanics',
  '2': 'Schrödinger Equation',
  '3': 'Quantum Wells and Barriers',
  '4': 'Harmonic Oscillator',
  '5': 'Tunneling and Resonance',
  '6': 'Density of States',
  '7': 'Band Structure',
  '8': 'Perturbation Theory',
  '9': 'Statistical Mechanics',
};

// ============ 工具函数 ============

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function getFileTypeConfig(filename) {
  const ext = path.extname(filename).toLowerCase();
  return FILE_TYPES[ext] || null;
}

function extractProgramInfo(filename) {
  const baseName = path.basename(filename, path.extname(filename));
  const match = baseName.match(CONFIG.PROGRAM_PATTERN);
  if (!match) return null;

  const [, chapter, type, number, variant] = match;
  const programId = `Chapt${chapter}${type}${number}${variant || ''}`;

  return {
    programId,
    chapter: `chapter${chapter}`,
    chapterNum: chapter,
    type,
    number,
    variant: variant || '',
    displayName: `Chapter ${chapter} - ${type} ${number}${variant ? variant.toUpperCase() : ''}`,
    chapterDisplay: parseInt(chapter, 10),
  };
}

function getChapterName(chapterNum) {
  return CHAPTER_NAMES[chapterNum] || `Chapter ${chapterNum}`;
}

function escapeForYaml(str) {
  if (str.includes(':') || str.includes('#') || str.includes('"') || str.includes("'")) {
    return `"${str.replace(/"/g, '\\"')}"`;
  }
  return str;
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ============ MDX 页面生成器 ============

/**
 * 生成程序入口页面 (index.mdx)
 */
function generateIndexPage(programInfo, filesList) {
  const { programId, displayName, chapterNum } = programInfo;
  const chapterName = getChapterName(chapterNum);

  // 构建文件卡片
  const fileCards = filesList.map(({ filename, fileType, staticPath, config }) => {
    const detailPageLink = `./${programId}_${config.type}`;

    return `
<div style={{
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '12px',
  backgroundColor: '#fafafa',
}}>
  <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'}}>
    <span style={{fontSize: '24px'}}>${config.emoji}</span>
    <div>
      <strong style={{color: '${config.color}'}}>${config.label}</strong>
      <div style={{fontSize: '12px', color: '#666'}}>\`${filename}\`</div>
    </div>
  </div>
  <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
    <a
      href="${detailPageLink}"
      style={{
        padding: '6px 12px',
        backgroundColor: '${config.color}',
        color: 'white',
        borderRadius: '4px',
        textDecoration: 'none',
        fontSize: '13px',
      }}
    >
      📖 View Details
    </a>
    <a
      href="${staticPath}"
      download="${filename}"
      style={{
        padding: '6px 12px',
        backgroundColor: '#10b981',
        color: 'white',
        borderRadius: '4px',
        textDecoration: 'none',
        fontSize: '13px',
      }}
    >
      📥 Download
    </a>
    <a
      href="${staticPath}"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        padding: '6px 12px',
        backgroundColor: '#6b7280',
        color: 'white',
        borderRadius: '4px',
        textDecoration: 'none',
        fontSize: '13px',
      }}
    >
      🔗 Open
    </a>
  </div>
</div>`;
  }).join('\n');

  // 文件类型统计
  const typeStats = filesList.map(f => f.config.emoji).join(' ');

  let viewerSection = '';
  if (CONFIG.VIEWER_BASE_URL) {
    const viewerUrl = `${CONFIG.VIEWER_BASE_URL}/${programId}`;
    viewerSection = `
<div style={{marginBottom: '24px'}}>
  <a
    href="${viewerUrl}"
    target="_blank"
    rel="noopener noreferrer"
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '14px 28px',
      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      color: 'white',
      borderRadius: '10px',
      textDecoration: 'none',
      fontWeight: 'bold',
      fontSize: '16px',
      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
  >
    🚀 Open Interactive Viewer
  </a>
</div>
`;
  }

  return `---
title: ${escapeForYaml(displayName)}
sidebar_label: ${escapeForYaml(displayName)}
---

# ${displayName}

> **Chapter ${parseInt(chapterNum, 10)}**: ${chapterName}
>
> ${typeStats} ${filesList.length} file(s) available
${viewerSection}
## Available Files

${fileCards}

---

*Program ID: \`${programId}\`*
`;
}

/**
 * 生成 MATLAB 详情页
 */
function generateMatlabPage(programInfo, filename, staticPath, fileContent, config) {
  const { displayName } = programInfo;

  let viewerSection = '';
  if (CONFIG.VIEWER_BASE_URL) {
    const viewerUrl = `${CONFIG.VIEWER_BASE_URL}/${programInfo.programId}`;
    viewerSection = `
  <a href="${viewerUrl}" target="_blank" rel="noopener noreferrer"
    style={{padding: '10px 20px', backgroundColor: '#6366f1', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold'}}>
    🚀 Interactive Viewer
  </a>`;
  }

  return `---
title: ${escapeForYaml(`${displayName} - MATLAB`)}
sidebar_label: MATLAB Code
---

# ${displayName} - MATLAB Code

<div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px'}}>
${viewerSection}
  <a href="${staticPath}" download="${filename}"
    style={{padding: '10px 20px', backgroundColor: '#10b981', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold'}}>
    📥 Download .m
  </a>
  <a href="${staticPath}" target="_blank" rel="noopener noreferrer"
    style={{padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold'}}>
    🔗 Open Raw
  </a>
</div>

## Source Code

\`\`\`matlab title="${filename}"
${fileContent || '% Unable to read file'}
\`\`\`

---

[← Back to ${displayName}](./)
`;
}

/**
 * 生成文本文件详情页
 */
function generateTextPage(programInfo, filename, staticPath, fileContent, config) {
  const { displayName } = programInfo;

  return `---
title: ${escapeForYaml(`${displayName} - Text`)}
sidebar_label: Text File
---

# ${displayName} - Text File

<div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px'}}>
  <a href="${staticPath}" download="${filename}"
    style={{padding: '10px 20px', backgroundColor: '#10b981', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold'}}>
    📥 Download
  </a>
  <a href="${staticPath}" target="_blank" rel="noopener noreferrer"
    style={{padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold'}}>
    🔗 Open Raw
  </a>
</div>

## Content

\`\`\`text title="${filename}"
${fileContent || 'Unable to read file'}
\`\`\`

---

[← Back to ${displayName}](./)
`;
}

/**
 * 根据文件类型生成对应的详情页
 */
function generateDetailPage(programInfo, filename, staticPath, fileContent, config) {
  switch (config.type) {
    case 'matlab':
      return generateMatlabPage(programInfo, filename, staticPath, fileContent, config);
    case 'text':
      return generateTextPage(programInfo, filename, staticPath, fileContent, config);
    default:
      return null;
  }
}

// ============ 主处理逻辑 ============

function processAllPrograms() {
  console.log('\n📚 Applied QM Documentation Generator v1.0');
  console.log('   For Levi\'s Applied Quantum Mechanics\n');

  const stats = {
    processed: 0,
    skipped: 0,
    byChapter: new Map(),
    byType: new Map(),
    programFiles: new Map(),
  };

  // 检查 INBOX 目录
  if (!fs.existsSync(CONFIG.INBOX_DIR)) {
    console.log(`❌ INBOX folder not found: ${CONFIG.INBOX_DIR}`);
    console.log(`   Please create it and add your files there.\n`);
    return;
  }

  // 扫描 INBOX
  const allFiles = fs.readdirSync(CONFIG.INBOX_DIR);
  const supportedFiles = allFiles.filter(f => {
    const ext = path.extname(f).toLowerCase();
    return CONFIG.SUPPORTED_EXTENSIONS.includes(ext);
  });

  console.log(`📥 Scanning INBOX: ${supportedFiles.length} supported file(s)\n`);

  if (supportedFiles.length === 0) {
    console.log('   No supported files found in INBOX.');
    console.log(`   Supported extensions: ${CONFIG.SUPPORTED_EXTENSIONS.join(', ')}\n`);
    return;
  }

  // 第一遍：收集所有文件，按 programId 分组
  supportedFiles.forEach(filename => {
    const programInfo = extractProgramInfo(filename);
    if (!programInfo) {
      console.log(`   ⚠️  Skipped (name doesn't match pattern): ${filename}`);
      stats.skipped++;
      return;
    }

    const config = getFileTypeConfig(filename);
    if (!config) {
      console.log(`   ⚠️  Skipped (unknown type): ${filename}`);
      stats.skipped++;
      return;
    }

    const { programId, chapterNum } = programInfo;

    // 按 programId 分组
    if (!stats.programFiles.has(programId)) {
      stats.programFiles.set(programId, {
        programInfo,
        files: [],
      });
    }
    stats.programFiles.get(programId).files.push({ filename, config });

    // 统计
    if (!stats.byChapter.has(chapterNum)) {
      stats.byChapter.set(chapterNum, new Set());
    }
    stats.byChapter.get(chapterNum).add(programId);

    if (!stats.byType.has(config.type)) {
      stats.byType.set(config.type, 0);
    }
    stats.byType.set(config.type, stats.byType.get(config.type) + 1);
  });

  // 第二遍：生成文档和复制文件
  console.log(`📁 Processing ${stats.programFiles.size} program(s)...\n`);

  stats.programFiles.forEach(({ programInfo, files }, programId) => {
    const { chapter } = programInfo;

    // 创建 docs 目录
    const programDocsDir = path.join(CONFIG.DOCS_OUTPUT_DIR, chapter, programId);
    ensureDir(programDocsDir);

    const filesList = [];

    // 处理每个文件
    files.forEach(({ filename, config }) => {
      // Static 目录
      const programStaticDir = path.join(CONFIG.STATIC_OUTPUT_DIR, config.type, programId);
      ensureDir(programStaticDir);

      const sourcePath = path.join(CONFIG.INBOX_DIR, filename);
      const staticDestPath = path.join(programStaticDir, filename);

      // 复制文件到 static
      try {
        fs.copyFileSync(sourcePath, staticDestPath);
      } catch (e) {
        console.log(`   ❌ Failed to copy: ${filename} - ${e.message}`);
        stats.skipped++;
        return;
      }

      // 静态路径
      const staticPath = `/programs/${config.type}/${programId}/${filename}`;

      // 读取文件内容
      let fileContent = '';
      if (config.canReadText) {
        try {
          fileContent = fs.readFileSync(sourcePath, 'utf-8');
        } catch (e) {
          console.log(`   ⚠️  Could not read text from: ${filename}`);
        }
      }

      // 生成详情页
      const detailContent = generateDetailPage(programInfo, filename, staticPath, fileContent, config);

      if (detailContent) {
        const detailFileName = `${programId}_${config.type}.mdx`;
        const detailPath = path.join(programDocsDir, detailFileName);

        try {
          fs.writeFileSync(detailPath, detailContent);
          stats.processed++;
        } catch (e) {
          console.log(`   ❌ Failed to write: ${detailFileName}`);
          stats.skipped++;
        }
      }

      filesList.push({
        filename,
        fileType: config.type,
        staticPath,
        config,
      });
    });

    // 生成 index.mdx
    if (filesList.length > 0) {
      const indexContent = generateIndexPage(programInfo, filesList);
      const indexPath = path.join(programDocsDir, 'index.mdx');

      try {
        fs.writeFileSync(indexPath, indexContent);
        const fileTypes = filesList.map(f => f.config.emoji).join('');
        console.log(`   ✅ ${programId}/ ${fileTypes} (${filesList.length} file(s))`);
      } catch (e) {
        console.log(`   ❌ Failed to write index for: ${programId}`);
      }
    }
  });

  // 生成 sidebar
  updateSidebar(stats.byChapter);

  // 打印汇总
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`✨ Generation Complete!\n`);
  console.log(`   📁 Programs:  ${stats.programFiles.size}`);
  console.log(`   📄 Files:     ${stats.processed}`);
  console.log(`   ⏭️  Skipped:   ${stats.skipped}`);

  if (stats.byType.size > 0) {
    console.log(`\n📊 Files by Type:`);
    Array.from(stats.byType.entries()).sort().forEach(([type, count]) => {
      const config = Object.values(FILE_TYPES).find(c => c.type === type);
      console.log(`   ${config?.emoji || '📄'} ${config?.label || type}: ${count}`);
    });
  }

  if (stats.byChapter.size > 0) {
    console.log(`\n📚 Programs by Chapter:`);
    Array.from(stats.byChapter.keys()).sort().forEach(ch => {
      const programs = stats.byChapter.get(ch);
      console.log(`   Chapter ${parseInt(ch, 10)}: ${programs.size} program(s)`);
    });
  }

  console.log(`\n📂 Output Structure:`);
  console.log(`   docs:   ${CONFIG.DOCS_OUTPUT_DIR}/chapter<N>/<programId>/`);
  console.log(`   static: ${CONFIG.STATIC_OUTPUT_DIR}/<type>/<programId>/\n`);
}

function updateSidebar(byChapter) {
  const sidebarPath = path.join(CONFIG.DOCS_OUTPUT_DIR, '../sidebars.js');

  const categories = Array.from(byChapter.keys()).sort((a, b) => parseInt(a) - parseInt(b)).map(chapterNum => {
    const programs = Array.from(byChapter.get(chapterNum)).sort();

    const items = programs.map(programId => {
      // Extract type and number for better label
      const match = programId.match(/Chapt(\d+)(Exercise|Fig)(\d+)([a-z]\d*)?/i);
      let label = programId;
      if (match) {
        const [, , type, num, variant] = match;
        label = `${type} ${num}${variant ? variant.toUpperCase() : ''}`;
      }

      return {
        type: 'doc',
        id: `chapter${chapterNum}/${programId}/index`,
        label,
      };
    });

    return {
      type: 'category',
      label: `Ch ${parseInt(chapterNum, 10)}: ${getChapterName(chapterNum)}`,
      collapsed: true,
      items,
    };
  });

  const sidebar = `/**
 * Auto-generated sidebar configuration
 * Generated by: generate-program-docs.js v1.0
 * Last updated: ${new Date().toISOString()}
 *
 * DO NOT EDIT MANUALLY - Changes will be overwritten on next generation
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: '📖 Introduction',
    },
    {
      type: 'category',
      label: '📚 Programs by Chapter',
      collapsed: false,
      items: [
${categories.map(cat => `        ${JSON.stringify(cat, null, 2).split('\n').join('\n        ')}`).join(',\n')},
      ],
    },
  ],
};

module.exports = sidebars;
`;

  try {
    fs.writeFileSync(sidebarPath, sidebar);
    console.log('✅ Sidebar configuration updated');
  } catch (e) {
    console.log(`⚠️  Failed to update sidebar: ${e.message}`);
  }
}

function cleanGenerated() {
  console.log('\n🧹 Cleaning generated documentation...\n');

  let cleanedCount = 0;

  // 清理 docs 中的 chapter 文件夹
  const docsDir = CONFIG.DOCS_OUTPUT_DIR;
  if (fs.existsSync(docsDir)) {
    const items = fs.readdirSync(docsDir);
    items.forEach(item => {
      if (item.startsWith('chapter')) {
        const fullPath = path.join(docsDir, item);
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`🗑️  Removed: docs/${item}/`);
        cleanedCount++;
      }
    });
  }

  // 清理 static/programs
  if (fs.existsSync(CONFIG.STATIC_OUTPUT_DIR)) {
    fs.rmSync(CONFIG.STATIC_OUTPUT_DIR, { recursive: true, force: true });
    console.log(`🗑️  Removed: static/programs/`);
    cleanedCount++;
  }

  console.log(`\n✨ Cleaned ${cleanedCount} folder(s)\n`);
}

function watchMode() {
  console.log(`\n👀 Watch Mode: Monitoring INBOX for changes...\n`);

  processAllPrograms();

  const debouncedProcess = debounce(() => {
    console.log('\n🔄 Changes detected, regenerating...\n');
    processAllPrograms();
    console.log('👀 Watching for changes...\n');
  }, 1000);

  if (!fs.existsSync(CONFIG.INBOX_DIR)) {
    console.log(`❌ Cannot watch: INBOX folder not found`);
    console.log(`   Please create: ${CONFIG.INBOX_DIR}\n`);
    return;
  }

  try {
    const watcher = fs.watch(CONFIG.INBOX_DIR, (eventType, filename) => {
      if (!filename) return;
      const ext = path.extname(filename).toLowerCase();
      if (CONFIG.SUPPORTED_EXTENSIONS.includes(ext)) {
        console.log(`📄 Change: ${filename}`);
        debouncedProcess();
      }
    });

    console.log(`   Watching: ${CONFIG.INBOX_DIR}/`);
    console.log('\nPress Ctrl+C to stop.\n');

    process.on('SIGINT', () => {
      console.log('\n\n👋 Stopping watch mode...');
      watcher.close();
      process.exit(0);
    });
  } catch (e) {
    console.log(`❌ Failed to start watcher: ${e.message}`);
  }
}

function showHelp() {
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║      Applied QM Documentation Generator v1.0                      ║
║      For Levi's Applied Quantum Mechanics MATLAB Programs         ║
╚════════════════════════════════════════════════════════════════════╝

Usage: node scripts/generate-program-docs.js [command]

Commands:
  (none)        Process all files in INBOX once
  --watch, -w   Watch INBOX for changes and auto-regenerate
  --clean, -c   Remove all generated documentation
  --help, -h    Show this help message

INBOX Location:
  ${CONFIG.INBOX_DIR}

  Drop ALL your files here:
    Chapt1Exercise8.m
    Chapt1Fig10.m
    Chapt2Fig24.m
    ...

Supported File Types:
  .m        MATLAB source code
  .txt      Text files (README, data files, etc.)

File Naming Pattern:
  Chapt<N><Type><#><variant>
    N = Chapter number (1-9)
    Type = Exercise or Fig
    # = Number
    variant = optional (a, b, c, a1, etc.)

  Examples:
    Chapt1Exercise8.m → Chapter 1, Exercise 8
    Chapt2Fig3a.m → Chapter 2, Figure 3a
`);
}

// ============ 入口 ============
const args = process.argv.slice(2);
const command = args[0];

if (command === '--watch' || command === '-w') {
  watchMode();
} else if (command === '--clean' || command === '-c') {
  cleanGenerated();
} else if (command === '--help' || command === '-h') {
  showHelp();
} else {
  processAllPrograms();
}
