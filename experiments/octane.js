const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const checkers = {
  //"FunCalledWithMoreArguments": "src/js/sample_analyses/dlint/FunCalledWithMoreArguments.js"
  //"NonContiguousArray": "src/js/sample_analyses/opt/NonContiguousArray.js",
  //"TypedArray": "src/js/sample_analyses/opt/TypedArray.js",
  "BranchCoverage": "src/js/sample_analyses/opt/BranchCoverage.js",
  //"CountObjectsPerAllocationSite": "src/js/sample_analyses/opt/CountObjectsPerAllocationSite.js",
  //"UndefinedOffset": "src/js/sample_analyses/opt/UndefinedOffset.js",
  //"ConcatUndefinedToString": "src/js/sample_analyses/opt/ConcatUndefinedToString.js"
};

process.chdir(path.join(__dirname, '../'));

const tmpDir = path.join(__dirname, 'tmp');

if (fs.existsSync(tmpDir)) {
  fs.rmdirSync(tmpDir, { recursive: true });
}
fs.mkdirSync(tmpDir);

const octaneDir = path.join(__dirname, '../tests/octane/');
//const files = fs.readFileSync(path.join(octaneDir, 'unitTests.txt')).toString().trim().split("\n");
const files = [
  //"code-load",
  //"crypto",
  "deltablue",
  //"earley-boyer",
  //"gbemu",
  //"navier-stokes",
  //"pdfjs",
  //"raytrace",
  //"regexp",
  //"richards",
  //"splay",
  //"typescript"
];
console.log(files);
for (let f of files) {
  let file = path.join(octaneDir, f + '.js');
  let dst = path.join(tmpDir, f + '.js');
  let jalangiDst = dst.replace('.js', '_jalangi_.js');
  fs.copyFileSync(file, dst);
  execSync(`node src/js/commands/esnstrument_cli.js --inlineIID ${dst}`);
  for (let checker in checkers) {
    execSync(`node src/js/commands/direct.js --analysis src/js/sample_analyses/ChainedAnalyses.js --analysis src/js/sample_analyses/dlint/Utils.js --analysis src/js/sample_analyses/opt/Utils.js --analysis src/js/sample_analyses/opt/RuntimeDB.js --analysis ${checkers[checker]} ${jalangiDst}`);
    fs.copyFileSync(`used.json`, path.join(tmpDir, `${f}_${checker}_used.json`));
    fs.copyFileSync(`counter.json`, path.join(tmpDir, `${f}_${checker}_counter.json`));
    let optDst = path.join(tmpDir, `${f}_${checker}_optimized_.js`);
    //execSync(`node instrument.js ${jalangiDst} ${optDst}`);
    execSync(`node src/js/commands/esnstrument_cli.js --inlineIID --used used.json --iidMap ${jalangiDst}on --out ${optDst} ${dst}`);
  }
  //execSync(`node tmp/${f + '.js'}`);
  //execSync(`node ${file}`);
}

const summary = {};

for (let f of files) {
  const dst = path.join(tmpDir, f);
  execSync(`node addTimestamp.js ${dst}.js`);
  execSync(`node addTimestamp.js ${dst}_jalangi_.js`);

  let stdout, type;
  stdout = execSync(`node ${dst}.js`).toString();
  console.log(stdout.trim());
  let lines = stdout.split('\n');
  let oriTime = +lines.shift();
  for (let checker in checkers) {
    let name = `${f}_${checker}`;
    summary[name] = {};
    summary[name].original = {
      time: oriTime
    };


    stdout = execSync(`node src/js/commands/direct.js --analysis src/js/sample_analyses/ChainedAnalyses.js --analysis src/js/sample_analyses/dlint/Utils.js --analysis src/js/sample_analyses/opt/Utils.js --analysis src/js/sample_analyses/opt/RuntimeDB.js --analysis ${checkers[checker]} ${dst}_jalangi_.js`).toString();
    console.log(stdout.trim());
    lines = stdout.split('\n');
    summary[name].jalangi = {
      time: +lines.shift(),
      instructions: lines.shift(),
      alarms: lines.sort().join(`\n`)
    };

    execSync(`node addTimestamp.js ${dst}_${checker}_optimized_.js`);
    stdout = execSync(`node src/js/commands/direct.js --analysis src/js/sample_analyses/ChainedAnalyses.js --analysis src/js/sample_analyses/dlint/Utils.js --analysis src/js/sample_analyses/opt/Utils.js --analysis src/js/sample_analyses/opt/RuntimeDB.js --analysis ${checkers[checker]} ${dst}_${checker}_optimized_.js`).toString();
    console.log(stdout.trim());
    lines = stdout.split('\n');
    summary[name].optimized = {
      time: +lines.shift(),
      instructions: lines.shift(),
      alarms: lines.sort().join(`\n`)
    };
  }
}
//console.log(summary);
for(let name in summary) {
  if (summary[name].jalangi.alarms !== summary[name].optimized.alarms) {
    console.log("assertion failed! different alarms");
    console.log(summary[name].jalangi.alarms);
    console.log(summary[name].optimized.alarms);
  }
}

console.log(`Program,Original Time(ms),Jalangi Time(ms),Optimzied Time(ms),# Used Inst.,# Total Inst.,Used Inst.(%),Jalangi Slowdown (x),Optimized Slowdown (x),Speedup (x)`);
for(let name in summary) {
  let res = summary[name];
  let inst = summary[name].jalangi.instructions;
  let idx = inst.indexOf("/");
  let used = inst.substring(0, idx);
  let total = inst.substring(idx + 1, inst.indexOf(" "));
  idx = inst.indexOf("(");
  let prop = inst.substring(idx + 1, inst.length - 2);
  let jSlow = (res.jalangi.time / res.original.time).toFixed(2);
  let oSlow = (res.optimized.time / res.original.time).toFixed(2);
  let speedup = (res.jalangi.time / res.optimized.time).toFixed(2);
  console.log(`${name},${res.original.time},${res.jalangi.time},${res.optimized.time},${used},${total},${prop},${jSlow},${oSlow},${speedup}`);
}
