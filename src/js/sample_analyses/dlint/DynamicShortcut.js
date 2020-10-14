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
          if(["object", "function"].includes(ty)) {
            let pp;
            if(iidMap[iid]) {
              pp = iidMap[iid][1];
            }
            const loc = pp + ":" + J$.____context.tracePartition.ToString();
            J$.____heap[loc] = val;

            if(ty === "function") {
              Object.defineProperty(val, "____Call", { value: +iidMap[iid][2], writable: true, configruable: true });
              Object.defineProperty(val, "____Construct", { value: +iidMap[iid][2], writable: true, configruable: true });
              Object.defineProperty(val, "____Scope", { value: J$.____context.outer[0], writable: true, configruable: true });
              sandbox.log(J$.____context.outer);
              let flag = true;
              let prototype = val.prototype;
              for(let loc in J$.____heap) {
                let ref = J$.____heap[loc];
                if(ref === prototype) {
                  flag = false;
                  break;
                }
              }
              if(flag) {
                let loc = iidMap[iid][3] + ":" + J$.____context.tracePartition.ToString();
                J$.____heap[loc] = prototype;
              }
            }
          }
        }

        this.invokeFunPre = function (iid, f, base, args, isConstructor, isMethod) {
          //sandbox.log(iidMap[iid]);
          if(iidMap[iid].length > 1) {
            J$.____context.outer.unshift(iidMap[iid][1] + ":" + J$.____context.tracePartition.ToString());
            J$.____context.tracePartition.callsiteList.unshift(iidMap[iid][3]);
          }
        }

        this.invokeFun = function (iid, f, base, args, result, isConstructor, isMethod) {
          if (["object", "function"].indexOf(typeof result) >= 0) {
            let flag = true;
            for(let loc in J$.____heap) {
              let ref = J$.____heap[loc];
              if(ref === result) {
                flag = false;
                break;
              }
            }
            if(flag) {
              let fid;
              if (isConstructor) {
                fid = f.____Construct;
              } else {
                fid = f.____Call;
              }
              let loc = "#" + fid + ":" + J$.____context.tracePartition.ToString();
              J$.____heap[loc] = result;
            }
          }
          if(iidMap[iid].length > 1) {
            J$.____context.outer.shift();
            J$.____context.tracePartition.callsiteList.shift();
          }
        }
    }
    sandbox.analysis = new MyAnalysis();
})(J$);



