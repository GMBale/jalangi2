const fs = require('fs');
const path = require('path');

const src = process.argv[2];

const code = fs.readFileSync(src).toString();
const added = `var ____startTime = new Date();
${code}
console.log(new Date() - ____startTime);`;
fs.writeFileSync(src, added);
