const fs = require('fs');
const path = require('path');

const walkDir = (dir, callback) => {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
};

walkDir(path.join(__dirname, 'client', 'src'), (filePath) => {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace common card backgrounds with glass-card
    content = content.replace(/bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/g, 'glass-card');
    
    // Auth cards
    content = content.replace(/bg-white dark:bg-slate-900 w-full max-w-md p-10 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800/g, 'glass-card w-full max-w-md p-10 rounded-2xl');

    // Layout topbar/sidebar replacements
    content = content.replace(/bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/g, 'glass-panel border-r');
    content = content.replace(/bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/g, 'glass-panel border-b');

    // Inputs inside cards
    content = content.replace(/bg-white dark:bg-slate-900/g, 'bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Processed', filePath);
  }
});
