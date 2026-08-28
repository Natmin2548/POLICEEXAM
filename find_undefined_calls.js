const fs = require('fs');
const js = fs.readFileSync('home/js/app.js', 'utf8');

// Find all function declarations: function foo( or const foo = or window.foo =
const definedFunctions = new Set([
  'escapeHTML', 'formatMessageContent', 'renderAvatarHtml', 'getApiBase',
  'showCenteredConfirm', 'showCenteredAlert', 'checkSession', 'initializeDashboard',
  'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'encodeURIComponent', 'decodeURIComponent',
  'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', 'fetch', 'alert', 'confirm', 'prompt',
  'require', 'console'
]);

const funcDecRegex = /(?:function\s+([a-zA-Z0-9_$]+)|(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>|(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*function|window\.([a-zA-Z0-9_$]+)\s*=\s*)/g;
let m;
while ((m = funcDecRegex.exec(js)) !== null) {
  const name = m[1] || m[2] || m[3] || m[4];
  if (name) definedFunctions.add(name);
}

// Find all function calls foo()
const callRegex = /\b([a-zA-Z0-9_$]+)\s*\(/g;
const calledFunctions = new Set();
while ((m = callRegex.exec(js)) !== null) {
  const name = m[1];
  // Ignore keywords and methods
  if (!['if', 'for', 'while', 'switch', 'catch', 'function', 'return', 'typeof', 'delete', 'new', 'async', 'await', 'import', 'export'].includes(name)) {
    calledFunctions.add(name);
  }
}

const undefinedCalls = [];
calledFunctions.forEach(name => {
  if (!definedFunctions.has(name)) {
    // Check if it's a known built-in or property
    if (!['String', 'Number', 'Boolean', 'Array', 'Object', 'Date', 'Math', 'JSON', 'RegExp', 'Promise', 'Error', 'Set', 'Map', 'Chart', 'Cropper', 'FormData', 'FileReader', 'Blob', 'URL', 'URLSearchParams', 'Event', 'CustomEvent', 'Image'].includes(name)) {
      undefinedCalls.push(name);
    }
  }
});

console.log('Undefined function calls found in app.js:');
undefinedCalls.forEach(fn => {
  // Check how many times and where it appears
  const count = (js.match(new RegExp(`\\b${fn}\\s*\\(`, 'g')) || []).length;
  console.log(`- ${fn} (called ${count} times)`);
});
