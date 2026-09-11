const fs = require('fs');
const p = 'client/src/pages/Chapter.jsx';
let c = fs.readFileSync(p, 'utf8');

// Replace all blue buttons
c = c.replace(/className="[^"]*bg-blue-600 hover:bg-blue-700[^"]*"/g, 'className="btn-glow w-full"');
// Replace all secondary buttons
c = c.replace(/className="[^"]*bg-slate-100 dark:bg-slate-800[^"]*"/g, 'className="btn-glass w-full"');

// Fix chat box container
c = c.replace(/bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800/g, 'bg-black/20 rounded-2xl border border-white/10 shadow-inner');

// Fix AI bubble
c = c.replace(/bg-white dark:bg-slate-800 text-white border border-slate-200 dark:border-slate-700/g, 'bg-white/10 text-white border border-white/20 backdrop-blur-md');

// Fix User bubble
c = c.replace(/bg-blue-600 text-white/g, 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg border border-cyan-400/30');

// Fix "Send" button in form
c = c.replace(/<button \n              type="submit"[\s\S]*?className="bg-blue-600[\s\S]*?<\/button>/g, '<button type="submit" disabled={asking} className="btn-glow px-4 py-3 disabled:opacity-70"><Send size={20} /></button>');

fs.writeFileSync(p, c);
console.log('Chapter.jsx updated');
