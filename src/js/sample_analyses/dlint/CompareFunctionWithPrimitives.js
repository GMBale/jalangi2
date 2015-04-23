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

// probably forgot to call a function before comparison
(function (sandbox) {
    function MyAnalysis () {
        var iidToJS = sandbox.iidToJS;

        var info = {};

        var resultStr = "";
        function printString(str) {
            resultStr += "<p>"+str+"</p>\n";
        }

        function printToDOM() {
            sandbox.Results.div.innerHTML = sandbox.Results.div.innerHTML + resultStr;
        }

        this.binary = function(iid, op, left, right, result){
            var type1 = typeof left;
            var type2 = typeof right;
            if (op === '==' ||
                op === '===' ||
                op === '!==' ||
                op === '!=' ||
                op === '<' ||
                op === '>' ||
                op === '<=' ||
                op === '>='){
                if ((type1 === 'function' && (type2 ==='string' || type2 ==='number' || type2==='boolean')) ||
                    (type2 === 'function' && (type1 ==='string' || type1 ==='number' || type1==='boolean'))) {
                    info[sandbox.getGlobalIID(iid)] = (info[sandbox.getGlobalIID(iid)] | 0) + 1;
                }
            }
        };

        this.endExecution = function() {
            sandbox.Utils.printInfo(info, function(x){
                printString("Comparing a function with a number or string or boolean at "+iidToJS(x.iid)+" "+ x.count+" time(s).");
                printToDOM();

            });
        };
    }
    sandbox.analysis = new MyAnalysis();
})(J$);



