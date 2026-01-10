const fs = require('fs');
const files = ['status_debug.txt', 'log_debug.txt', 'push_debug.txt'];
files.forEach(f => {
  try {
    if (fs.existsSync(f)) {
      const content = fs.readFileSync(f, 'utf16le');
      fs.writeFileSync('clean_' + f, content, 'utf8');
      console.log('Converted ' + f);
    } else {
      console.log('Missing ' + f);
    }
  } catch (e) {
    console.error('Error converting ' + f, e);
  }
});
