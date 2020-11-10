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
        var trueBranches = {};
        var falseBranches = {};
        var fs = require('fs');
        var iidMap = JSON.parse(fs.readFileSync(__dirname + "/iidMap.json"));
        var Constants = sandbox.Constants;
        var HOP = Constants.HOP;
        var sort = Array.prototype.sort;

        var info = {};

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
            J$.____heap[loc] = val;
            if(!J$.____refMap.has(val)) {
              J$.____refMap.set(val, loc);
            }

            if(ty === "function") {
              J$.____funcInfo.set(val, {
                "____Call": +iidMap[iid][2],
                "____Construct": +iidMap[iid][2],
                "____Scope": J$.____context.env[0]
              });

              let prototype = val.prototype;
              let loc = iidMap[iid][3] + ":" + J$.____context.tracePartition.ToString();
              J$.____heap[loc] = prototype;
              if(!J$.____refMap.has(prototype)) {
                J$.____refMap.set(prototype, loc);
              }
            }
          }
        }

        this.invokeFunPre = function (iid, f, base, args, isConstructor, isMethod) {
          if(iid === 217577) {
            print(iid);
            print(J$.____refMap.get(f));
          }
          J$.____path.push("invokeFunPre: " + iid);
          let prop = "Call";
          if(isConstructor) {
            prop = "Construct";
            J$.____isConstructor = iidMap[iid][prop][5] + ":" + J$.____context.tracePartition.ToString();
          }
          J$.____argumentsLoc = iidMap[iid][prop][4] + ":" + J$.____context.tracePartition.ToString();
          if(iidMap[iid][prop] && iidMap[iid][prop].length > 1) {
            J$.____context.env.unshift(iidMap[iid][prop][1] + ":" + J$.____context.tracePartition.ToString());
            if(J$.____context.tracePartition.length) {
              J$.____context.tracePartition[0].callsiteList.unshift(iidMap[iid][prop][3]);
            } else {
              J$.____context.tracePartition.callsiteList.unshift(iidMap[iid][prop][3]);
            }
            if(f === Function.prototype.call) {
              J$.____context.tracePartition[0].callsiteList.unshift(J$.__builtinInfo.callBId);
            } else if(f === Function.prototype.apply) {
              J$.____context.tracePartition[0].callsiteList.unshift(J$.__builtinInfo.applyBId);
            }
          }
        }

        this.invokeFun = function (iid, f, base, args, result, isConstructor, isMethod) {
          J$.____isConstructor = undefined;
          J$.____argumentsLoc = undefined;
          let prop = "Call";
          if(isConstructor) {
            prop = "Construct";
          }
          if (result !== null && ["object", "function"].indexOf(typeof result) >= 0) {
            if(!J$.____refMap.has(result)) {
              let fid;
              if (isConstructor) {
                fid = J$.____funcInfo.get(f).____Construct;
              } else {
                fid = J$.____funcInfo.get(f).____Call;
              }

              let loc = "#" + fid + ":" + J$.____context.tracePartition.ToString();
              J$.____heap[loc] = result;
              J$.____refMap.set(result, loc);
            }
          }
          if(iidMap[iid][prop] && iidMap[iid][prop].length > 1) {
            const getter = J$.____context.env.shift();
            for(let tv in getter) {
              if(tv.startsWith("<>")) {
                let vName = tv.substring(2, tv.lastIndexOf("<>"));
                J$.____var2env[vName].shift();
              }
            }
            if(J$.____context.tracePartition.length) {
              const last = J$.____context.tracePartition[0].callsiteList.shift();
              const fid = +last.substring(0, last.indexOf(":"));
              if(fid < 0) J$.____context.tracePartition[0].callsiteList.shift();
            } else {
              const last = J$.____context.tracePartition.callsiteList.shift();
              const fid = +last.substring(0, last.indexOf(":"));
              if(fid < 0) J$.____context.tracePartition.callsiteList.shift();
            }
          }
        }

        this.functionExit = function (iid, returnVal, wrappedExceptionVal) {
          J$.____stack.pop(iid);
          if(wrappedExceptionVal !== undefined) {
            if(wrappedExceptionVal.exception.message.endsWith("a proxy that has been revoked")) {
              throw wrappedExceptionVal.exception;
            }
          }
        }
        this.functionEnter = function (iid, f, dis, args, getter) {
          J$.____path.push(iid);
          J$.____stack.push(iid);

          // arguments
          J$.____heap[J$.____argumentsLoc] = args;
          if(!J$.____refMap.has(args)) {
            J$.____refMap.set(args, J$.____argumentsLoc);
          }

          // this 
          if(J$.____isConstructor) {
            J$.____heap[J$.____isConstructor] = dis;
            if(!J$.____refMap.has(dis)) {
              J$.____refMap.set(dis, J$.____isConstructor);
            }
          }
          let funcInfo = J$.____funcInfo.get(f);
          if(funcInfo) {
            J$.____visitedEntryControlPoints.add(J$.____funcInfo.get(f).____Call + "+" + J$.____context.tracePartition.tpToString());
          }
          J$.____context.map[J$.____context.env[0]] = getter;
          for(let tv in getter) {
            if(tv.startsWith("<>")) {
              let vName = tv.substring(2, tv.lastIndexOf("<>"));
              if(J$.____var2env[vName]) {
                J$.____var2env[vName].unshift(J$.____context.env[0]);
              } else {
                J$.____var2env[vName] = [J$.____context.env[0]];
              }
            }
          }

          if(funcInfo && funcInfo.____Scope) {
            getter.____outer = funcInfo.____Scope;
          } else {
            getter.____outer = "#Global:Sens[(30-CFA()|LSA[i:10,j:400]())]";
          }
        }
        this.LE = function (iid) {
          if(J$.____context.tracePartition.length) {
            J$.____context.tracePartition[1].iterList.unshift(iidMap[iid][1] + "(0)");
          }
        }

        this.LI = function (iter) {
          if(J$.____context.tracePartition.length) {
            var cur = J$.____context.tracePartition[1].iterList[0];
            J$.____context.tracePartition[1].iterList[0] = cur.substring(0, cur.lastIndexOf("(")) + "(" + iter + ")";
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
                if(locObj === undefined) {
                  throw new Error(id + " " + str);
                }
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



