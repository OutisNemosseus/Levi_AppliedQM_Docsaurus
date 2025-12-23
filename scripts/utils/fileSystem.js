/**
 * @fileoverview File system operations abstraction
 * @module utils/fileSystem
 */

const fs = require('fs');
const path = require('path');

/**
 * Create a file system interface
 * @param {string} [basePath=process.cwd()] - Base path for relative operations
 * @returns {Object} File system interface
 * @example
 * const fileSystem = createFileSystem('/project');
 * fileSystem.ensureDir('/project/output');
 * fileSystem.writeFile('/project/output/file.txt', 'content');
 */
function createFileSystem(basePath = process.cwd()) {
  return {
    /**
     * Get the base path
     * @returns {string} Base path
     */
    getBasePath() {
      return basePath;
    },

    /**
     * Resolve a path relative to base
     * @param {...string} parts - Path parts
     * @returns {string} Resolved absolute path
     */
    resolve(...parts) {
      return path.resolve(basePath, ...parts);
    },

    /**
     * Check if a path exists
     * @param {string} filePath - Path to check
     * @returns {boolean} True if exists
     */
    exists(filePath) {
      return fs.existsSync(filePath);
    },

    /**
     * Ensure a directory exists, creating if necessary
     * @param {string} dirPath - Directory path
     */
    ensureDir(dirPath) {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    },

    /**
     * Read a file as text
     * @param {string} filePath - File path
     * @param {string} [encoding='utf-8'] - File encoding
     * @returns {string|null} File content or null on error
     */
    readFile(filePath, encoding = 'utf-8') {
      try {
        return fs.readFileSync(filePath, encoding);
      } catch (e) {
        return null;
      }
    },

    /**
     * Write content to a file
     * @param {string} filePath - File path
     * @param {string} content - Content to write
     * @returns {boolean} True if successful
     */
    writeFile(filePath, content) {
      try {
        fs.writeFileSync(filePath, content);
        return true;
      } catch (e) {
        return false;
      }
    },

    /**
     * Copy a file
     * @param {string} src - Source path
     * @param {string} dest - Destination path
     * @returns {boolean} True if successful
     */
    copyFile(src, dest) {
      try {
        fs.copyFileSync(src, dest);
        return true;
      } catch (e) {
        return false;
      }
    },

    /**
     * Remove a directory recursively
     * @param {string} dirPath - Directory path
     * @returns {boolean} True if successful
     */
    removeDir(dirPath) {
      try {
        if (fs.existsSync(dirPath)) {
          fs.rmSync(dirPath, { recursive: true, force: true });
        }
        return true;
      } catch (e) {
        return false;
      }
    },

    /**
     * Read directory contents
     * @param {string} dirPath - Directory path
     * @returns {string[]} Array of filenames
     */
    readDir(dirPath) {
      try {
        return fs.readdirSync(dirPath);
      } catch (e) {
        return [];
      }
    },

    /**
     * Read directory with file type info
     * @param {string} dirPath - Directory path
     * @returns {fs.Dirent[]} Array of directory entries
     */
    readDirWithTypes(dirPath) {
      try {
        return fs.readdirSync(dirPath, { withFileTypes: true });
      } catch (e) {
        return [];
      }
    },

    /**
     * Scan directory for files, optionally recursive
     * @param {string} dir - Directory to scan
     * @param {boolean} [recursive=false] - Scan subdirectories
     * @returns {string[]} Array of file paths (relative to dir)
     */
    scanDirectory(dir, recursive = false) {
      const results = [];

      if (!fs.existsSync(dir)) {
        return results;
      }

      const items = fs.readdirSync(dir, { withFileTypes: true });

      for (const item of items) {
        if (item.isDirectory()) {
          if (recursive) {
            const subFiles = this.scanDirectory(path.join(dir, item.name), true);
            results.push(...subFiles.map(f => path.join(item.name, f)));
          }
        } else if (item.isFile()) {
          results.push(item.name);
        }
      }

      return results;
    },

    /**
     * Get file extension
     * @param {string} filename - Filename
     * @returns {string} Extension (with dot)
     */
    getExtension(filename) {
      return path.extname(filename).toLowerCase();
    },

    /**
     * Get filename without extension
     * @param {string} filename - Filename
     * @returns {string} Base name
     */
    getBaseName(filename) {
      return path.basename(filename, path.extname(filename));
    },

    /**
     * Join path parts
     * @param {...string} parts - Path parts
     * @returns {string} Joined path
     */
    join(...parts) {
      return path.join(...parts);
    },

    /**
     * Watch a directory for changes
     * @param {string} dirPath - Directory to watch
     * @param {Function} callback - Callback(eventType, filename)
     * @returns {fs.FSWatcher} Watcher instance
     */
    watch(dirPath, callback) {
      return fs.watch(dirPath, callback);
    },
  };
}

module.exports = {
  createFileSystem,
};
