/*
 * Copyright (c) 2014 Samsung Electronics Co., Ltd.
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
// Author: Koushik Sen

// do not remove the following comment
// JALANGI DO NOT INSTRUMENT


(function (sandbox) {
    function MyAnalysis () {
        J$.____path = [];
        let newLoc = 10000000;
        var trueBranches = {};
        var falseBranches = {};
        var fs = require('fs');
        var iidMap = JSON.parse(fs.readFileSync(__dirname + "/iidMap.json"));
        var Constants = sandbox.Constants;
        var HOP = Constants.HOP;
        var sort = Array.prototype.sort;

        this.binary = function (iid, op, left, right, isOpAssign, isSwitchCaseComparison, isComputed) {
          if (["object", "function"].indexOf(typeof left) >= 0) {
            if(null !== left) {
              "____#" in left;
            }
          }
          if (["object", "function"].indexOf(typeof right) >= 0) {
            if(null !== right) {
              "____#" in right;
            }
          }
        }

        this.unaryPre = function(iid, op, left){
          if (["object", "function"].indexOf(typeof left) >= 0) {
            if(null !== left) {
              "____#" in left;
            }
          }
        };

        this.literal = function (iid, val, hasGetterSetter) {
          var ty = typeof val;
          if(val !== null && ["object", "function"].includes(ty)) {
            const loc = iidMap[iid][1] + ":" + J$.____context.tracePartition.ToString();
            if(!J$.____refMap.has(val)) {
              J$.____refMap.set(val, loc);
            }

            if(ty === "function") {
              J$.____funcInfo.set(val, {
                "____Call": +iidMap[iid][2],
                "____Construct": +iidMap[iid][2],
                "____Outer": J$.____envs[0]
              });

              let prototype = val.prototype;
              const loc = iidMap[iid][3] + ":" + J$.____context.tracePartition.ToString();
              if(!J$.____refMap.has(prototype)) {
                J$.____refMap.set(prototype, loc);
              }
            }
          }
        }

        this.invokeFunPre = function (iid, f, base, args, isConstructor, isMethod) {
          let prop = "Call";
          if(isConstructor) {
            prop = "Construct";
            J$.____isConstructor = iidMap[iid][prop][5] + ":" + J$.____context.tracePartition.ToString();
          }
          J$.____argumentsLoc.push(iidMap[iid][prop][4] + ":" + J$.____context.tracePartition.ToString());
          J$.____path.push("invokeFunPre: " + iid + " " + J$.____refMap.get(f) + " " + J$.____argumentsLoc[J$.____argumentsLoc.length - 1]);
          if(iidMap[iid][prop] && iidMap[iid][prop].length > 1) {
            J$.____context.envLocs.unshift(iidMap[iid][prop][1] + ":" + J$.____context.tracePartition.ToString());
            if(J$.____context.tracePartition.length) {
              J$.____context.tracePartition[0].callsiteList.unshift(iidMap[iid][prop][3]);
            } else {
              J$.____context.tracePartition.callsiteList.unshift(iidMap[iid][prop][3]);
            }
            if(f === Function.prototype.call) {
              J$.____context.tracePartition[0].callsiteList.unshift(J$.__builtinInfo.callBId);
            } else if(f === Function.prototype.apply) {
              J$.____context.tracePartition[0].callsiteList.unshift(J$.__builtinInfo.applyBId);
            } else if(f === Array.prototype.every) {
              J$.____context.tracePartition[1].iterList.unshift(J$.__builtinInfo.everyLId + "(0)");
              J$.____everyCount = 0;
            }
          }
        }

        this.invokeFun = function (iid, f, base, args, result, isConstructor, isMethod) {
          J$.____path.push("invokeFun: " + iid + " " + J$.____refMap.get(f) + " " + J$.____argumentsLoc[J$.____argumentsLoc.length - 1]);
          J$.____isConstructor = undefined;
          J$.____argumentsLoc.pop();
          let prop = "Call";
          if(isConstructor) {
            prop = "Construct";
          }
          if (result !== null && ["object", "function"].indexOf(typeof result) >= 0 && !J$.isSymbol(result)) {
            if(!J$.____refMap.has(result)) {

              let fid;
              if (isConstructor) {
                fid = J$.____funcInfo.get(f).____Construct;
              } else {
                fid = J$.____funcInfo.get(f).____Call;
              }

              const loc = "#" + fid + ":" + J$.____context.tracePartition.ToString();

              J$.____refMap.set(result, loc);
            }
          }

          if(iidMap[iid][prop] && iidMap[iid][prop].length > 1) {
            J$.____context.envLocs.shift();

            if(J$.____context.tracePartition.length) {
              const last = J$.____context.tracePartition[0].callsiteList.shift();
              const fid = +last.substring(0, last.indexOf(":"));
              if(fid < 0) J$.____context.tracePartition[0].callsiteList.shift();
            } else {
              const last = J$.____context.tracePartition.callsiteList.shift();
              const fid = +last.substring(0, last.indexOf(":"));
              if(fid < 0) J$.____context.tracePartition.callsiteList.shift();
            }
            if(f === Array.prototype.every) {
              delete J$.____everyCount;
              J$.____context.tracePartition[1].iterList.shift();
            }
          }
        }

        this.read = function (iid, name, val, isGlobal, isScriptLocal) {
          if(name === "arguments") {
            const loc = J$.____argumentsLoc[J$.____argumentsLoc.length - 1];
            if(!J$.____refMap.has(val)) {
              J$.____refMap.set(val, loc);
            }
          }
        }

        this.functionExit = function (iid, returnVal, wrappedExceptionVal) {
          const info = J$.____stack.pop();
          J$.____envs.shift();

          const diff = J$.____context.tracePartition[1].iterList.length - info.iterLength
          if(diff > 0) {
            J$.____context.tracePartition[1].iterList.splice(0, diff);
          }
          if(wrappedExceptionVal !== undefined) {
            if(wrappedExceptionVal.exception.message && wrappedExceptionVal.exception.message.endsWith("a proxy that has been revoked")) {
              throw wrappedExceptionVal.exception;
            }
          }

          if(info.entryCPLength < J$.____visitedEntryControlPoints.length) {
            J$.____visitedEntryControlPoints.length = info.entryCPLength;
          }

          if("____everyCount" in J$) {
            ++J$.____everyCount;
            var cur = J$.____context.tracePartition[1].iterList[0];
            J$.____context.tracePartition[1].iterList[0] = J$.substring.call(cur, 0, J$.lastIndexOf.call(cur, "(")) + "(" + J$.____everyCount + ")";
          }
        }
        this.functionEnter = function (iid, f, dis, args, getter) {
          J$.____path.push(iid);
          J$.____envs.unshift(getter);
          J$.____stack.push({
            iid,
            iterLength: J$.____context.tracePartition[1].iterList.length,
            entryCPLength: J$.____visitedEntryControlPoints.length
          });

          const funcInfo = J$.____funcInfo.get(f);
          if(funcInfo) J$.____visitedEntryControlPoints.push(J$.____funcInfo.get(f).____Call + "+" + J$.____context.tracePartition.tpToString());

          if("____everyCount" in J$) {
            J$.____context.envLocs.shift();
            J$.____context.envLocs.unshift("#" + J$.__builtinInfo.everyBId + ":" + J$.____context.tracePartition.ToString());
          }

          // this 
          if(J$.____isConstructor) {
            if(!J$.____refMap.has(dis)) {
              const loc = J$.____isConstructor;
              J$.____refMap.set(dis, loc);
            }
          }
          if(J$.____context.envLocs.length > 0) {
            const envLoc = J$.____context.envLocs[0];
            J$.____context.envMap.set(getter, envLoc);
          }
          let outer = null;
          if(J$.____envs.length > 1) {
            outer = J$.____envs[1];
          }
          J$.defineProperty(getter, "____outer", { value: outer, writable: true, enumerable: false, configurable: true });
        }
        this.LE = function (iid) {
          if(J$.____context.tracePartition.length) {
            J$.____context.tracePartition[1].iterList.unshift(iidMap[iid][1] + "(0)");
          }
        }

        this.LI = function (iter) {
          if(J$.____context.tracePartition.length) {
            var cur = J$.____context.tracePartition[1].iterList[0];
            J$.____context.tracePartition[1].iterList[0] = J$.substring.call(cur, 0, J$.lastIndexOf.call(cur, "(")) + "(" + iter + ")";
          }
        }

        this.LR = function () {
          if(J$.____context.tracePartition.length) {
            J$.____context.tracePartition[1].iterList.shift();
          }
        }

        this.conditional = function (iid, result) {
          if (result)
            trueBranches[iid] = (trueBranches[iid]|0) + 1;
          else
            falseBranches[iid] = (falseBranches[iid]|0) + 1;
        };

        this.endExecution = function () {
          const sb = [];
          for (let [map, str] of [[trueBranches, "True"], [falseBranches, "False"]]) {
            for (var id in map) {
              if (map.hasOwnProperty(id)) {
                const locObj = J$.iids[id];
                let loc = `(${J$.filename}:${locObj.join(":")})`;
                sb.push(str + " branch taken at " + loc + " " + map[id] + " times");
              }
            }
          }
          return sb.join("\n");
        };
    }
    sandbox.analysis = new MyAnalysis();
})(J$);



