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
        var iidToLocation = sandbox.iidToLocation;
        var fs = require('fs');
        var iidMap = JSON.parse(fs.readFileSync("iidMap.json"));
        var Constants = sandbox.Constants;
        var HOP = Constants.HOP;
        var sort = Array.prototype.sort;

        var info = {};

        this.unaryPre = function(iid, op, left){
          if (op === "typeof" && ["object", "function"].indexOf(typeof left) >= 0) {
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
            J$.____refMap.set(val, loc);

            if(ty === "function") {
              Object.defineProperty(val, "____Call", { value: +iidMap[iid][2], writable: true, configruable: true });
              Object.defineProperty(val, "____Construct", { value: +iidMap[iid][2], writable: true, configruable: true });
              Object.defineProperty(val, "____Scope", { value: J$.____context.env[0], writable: true, configruable: true });
              let prototype = val.prototype;
              const flag = !J$.____refMap.has(prototype);
              if(flag) {
                let loc = iidMap[iid][3] + ":" + J$.____context.tracePartition.ToString();
                J$.____heap[loc] = prototype;
                J$.____refMap.set(prototype, loc);
              }
            }
          }
        }

        this.invokeFunPre = function (iid, f, base, args, isConstructor, isMethod) {
          if(isConstructor) {
            J$.____isConstructor = iidMap[iid][4] + ":" + J$.____context.tracePartition.ToString();
          }
          if(iidMap[iid].length > 1) {
            J$.____context.env.unshift(iidMap[iid][1] + ":" + J$.____context.tracePartition.ToString());
            if(J$.____context.tracePartition.length) {
              J$.____context.tracePartition[0].callsiteList.unshift(iidMap[iid][3]);
            } else {
              J$.____context.tracePartition.callsiteList.unshift(iidMap[iid][3]);
            }
            if(f === Function.prototype.call) {
              if(J$.____context.tracePartition.length) {
                J$.____context.tracePartition[0].callsiteList.unshift("-102:16");
              } else {
                J$.____context.tracePartition.callsiteList.unshift("-102:16");
              }
            }
          }
        }

        this.invokeFun = function (iid, f, base, args, result, isConstructor, isMethod) {
          J$.____isConstructor = undefined;
          if (["object", "function"].indexOf(typeof result) >= 0) {
            const flag = !J$.____refMap.has(result);
            if(flag) {
              let fid;
              if (isConstructor) {
                fid = f.____Construct;
              } else {
                fid = f.____Call;
              }
              let loc = "#" + fid + ":" + J$.____context.tracePartition.ToString();
              J$.____heap[loc] = result;
              J$.____refMap.set(result, loc);
            }
          }
          if(iidMap[iid].length > 1) {
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

        this.write = function (iid, name, val, lhs, isGlobal, isScriptLocal) {
          if(isGlobal) {
            const key = "#Global:Sens[(30-CFA()|LSA[i:10,j:400]())] " + name;
            if(!J$.____mutation.has(key)) {
              J$.____mutation.set(key, J$.____alphaValue(lhs));
            }
          } else if(J$.____var2env[name]) {
            const key = `${J$.____var2env[name][0]}@${name}`;
            if(!J$.____mutation.has(key)) {
              J$.____mutation.set(key, J$.____alphaValue(lhs));
            }
          }
        }
        this.putFieldPre = function (iid, base, offset, val, isComputed, isOpAssign) {
          const key = `${J$.____refMap.get(base)} ${offset}`;
          if(!J$.____mutation.has(key)) {
            //if(J$.____refMap.get(base) === undefined) {
            //  throw new Error(iid + "  " + J$.____context.tracePartition.ToString());
            //}
            const desc = Object.getOwnPropertyDescriptor(base, offset);
            const value = desc ? J$.____alphaValue(desc.value) : "⊥";
            J$.____mutation.set(key, value);
          }
        }
        this.functionExit = function (iid, returnVal, wrappedExceptionVal) {
          if(wrappedExceptionVal !== undefined) {
            if(wrappedExceptionVal.exception.message.endsWith("a proxy that has been revoked")) {
              throw wrappedExceptionVal.exception;
            }
          }
        }
        this.functionEnter = function (iid, f, dis, args, getter) {
          if(J$.____isConstructor) {
            J$.____heap[J$.____isConstructor] = dis;
            J$.____refMap.set(dis, J$.____isConstructor);
          }
          J$.____visitedEntryControlPoints.add(f.____Call + "+" + J$.____context.tracePartition.ToString());
          if(J$.____context.tracePartition[0].callsiteList.length === 1) {
            J$.____mutation = new J$.Map();
            const nargs = [];
            for(let arg of args) {
              nargs.push(J$.____alphaValue(arg));
            }
            J$.____checkpoint = {
              fid: f.____Call,
              tracePartition: J$.____context.tracePartition.ToString(),
              this: J$.____alphaValue(f),
              arguments: nargs
            }
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
          getter.____outer = f.____Scope;
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

    }
    sandbox.analysis = new MyAnalysis();
})(J$);



