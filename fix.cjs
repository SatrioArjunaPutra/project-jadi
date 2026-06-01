const fs = require('fs');
['src/data/tourismData.js', 'src/data/kulinerData.js'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\\"\//g, '"/');
  fs.writeFileSync(file, content);
});
console.log("Fixed!");
