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
        var stack = [];
        var Constants = sandbox.Constants;
        var HOP = Constants.HOP;
        var sort = Array.prototype.sort;

        this.invokeFunPre = function (iid, f, base, args, isConstructor, isMethod) {
          stack.push([iid, "FunPre", f]);
        }

        this.invokeFun = function (iid, f, base, args, result, isConstructor, isMethod) {
          const [tiid, tfun] = stack.pop();
        }

        this.functionExit = function (iid, returnVal, wrappedExceptionVal) {
          stack.pop();
        }
        this.functionEnter = function (iid, f, dis, args, getter) {
          const top = stack[stack.length - 1];
          stack.push([iid, "Enter"]);
          if(top !== undefined) {
            const [tiid, tfunName, tfun] = top;
            if(tfunName !== "FunPre") {
              if(tfun !== Array.prototype.every) {
                console.warn(tfun);
                throw new Error(stack.map(([tiid, tfun]) => [tiid, tfun]).join("\n"));
              }
            }
          }
        }

        this.endExecution = function () {
          console.log("PASS");
        };
    }
    sandbox.analysis = new MyAnalysis();
})(J$);



