/*
 * Copyright 2014 Samsung Information Systems America, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Author: Manu Sridharan
// Author: Koushik Sen

/*jslint node: true */
/*global process */
/*global J$ */

var sb = [];
var fs = require('fs');
var path = require('path');
var argparse = require('argparse');
var parser = new argparse.ArgumentParser({
    addHelp: true,
    description: "Command-line utility to perform Jalangi2's analysis"
});
parser.addArgument(['--analysis'], { help: "absolute path to analysis file to run", action:'append'});
parser.addArgument(['--initParam'], { help: "initialization parameter for analysis, specified as key:value", action:'append'});
parser.addArgument(['script_and_args'], {
    help: "script to record and CLI arguments for that script",
    nargs: argparse.Const.REMAINDER
});
var args = parser.parseArgs();

function runAnalysis(initParam) {
    if (args.script_and_args.length === 0) {
        console.error("must provide script to record");
        process.exit(1);
    }
    // we shift here so we can use the rest of the array later when
    // hacking process.argv; see below

    //acorn = require("acorn");
    sb.push(fs.readFileSync(path.join(__dirname, "node_modules/acorn/dist/acorn.js")).toString());
    //esotope = require("esotope");
    sb.push(fs.readFileSync(path.join(__dirname, "node_modules/esotope/esotope.js")).toString());
    require(path.join(__dirname, '/src/js/headers')).headerSources.forEach(function(header){
      sb.push(fs.readFileSync(path.join(__dirname, header)).toString());
        //require("./../../../"+header);
    });

    if (args.analysis) {
        args.analysis.forEach(function (src) {
            sb.push(fs.readFileSync(path.join(__dirname, src)).toString());
            //require(path.resolve(src));
        });
    }
}

var initParam = null;
if (args.initParam) {
    initParam = {};
    args.initParam.forEach(function (keyVal) {
        var split = keyVal.split(':');
        if (split.length !== 2) {
            throw new Error("invalid initParam " + keyVal);
        }
        initParam[split[0]] = split[1];
    });
}
runAnalysis(initParam);

var script = args.script_and_args.shift();
var scriptCode = fs.readFileSync(script).toString();
var fmap = JSON.parse(fs.readFileSync(path.join(path.dirname(script), "function.json")));
var point = "eval(J$.____arguments[0]);";
var idx = scriptCode.indexOf(point);
sb.push(scriptCode.substring(0, idx));
sb.push(fmap[0]);
sb.push(scriptCode.substring(idx + point.length));
fs.writeFileSync(path.join(path.dirname(script), "direct_vanilla.js"), sb.join("\n"));