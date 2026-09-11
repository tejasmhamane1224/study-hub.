const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const clientSrcDir = path.join(__dirname, 'client', 'src');

walkDir(clientSrcDir, (filePath) => {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. Inputs: Replace the massive tailwind string for inputs with `glass-input`
    // e.g., className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
    content = content.replace(/className="[^"]*w-full p-3 border[^"]*focus:outline-none[^"]*"/g, 'className="glass-input"');
    content = content.replace(/className="[^"]*flex-1 p-3 border[^"]*focus:outline-none[^"]*"/g, 'className="glass-input"');

    // 2. Buttons (Primary)
    // Primary: "bg-blue-600 text-white..."
    content = content.replace(/className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"/g, 'className="w-full btn-glow"');
    content = content.replace(/className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"/g, 'className="btn-glow"');
    content = content.replace(/className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"/g, 'className="btn-glow"');
    
    // 3. Buttons (Secondary)
    // Secondary: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300..."
    content = content.replace(/className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"/g, 'className="btn-glass"');

    // 4. Text Cleanup
    // Change "text-slate-900 dark:text-white" to just "text-white" or drop it if it inherits
    content = content.replace(/text-slate-900 dark:text-white/g, 'text-white');
    content = content.replace(/text-slate-500 dark:text-slate-400/g, 'text-slate-400');
    content = content.replace(/text-blue-600 dark:text-blue-400/g, 'text-cyan-400');
    content = content.replace(/text-blue-600/g, 'text-cyan-400');
    content = content.replace(/text-indigo-600/g, 'text-cyan-400');

    // 5. Layout Sidebar Active Links
    // From: 'bg-indigo-50 text-blue-600 dark:bg-slate-800 dark:text-blue-400' 
    // To: 'bg-white/10 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
    content = content.replace(/'bg-indigo-50 text-cyan-400 dark:bg-slate-800 dark:text-cyan-400'/g, "'bg-white/10 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]'");
    
    // 6. Layout Sidebar Inactive Links
    // From: 'text-slate-500 hover:bg-indigo-50 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400'
    // To: 'text-slate-400 hover:bg-white/5 hover:text-white'
    content = content.replace(/'text-slate-500 hover:bg-indigo-50 hover:text-cyan-400 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-cyan-400'/g, "'text-slate-400 hover:bg-white/5 hover:text-white'");

    // 7. Remove remaining dark: prefixes since the whole app is now dark glassmorphism
    // Actually, just leaving them doesn't hurt as the body will be dark by default or the theme is strictly dark.

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated components in:', filePath);
    }
  }
});
console.log('Done redesigning forms and buttons.');
