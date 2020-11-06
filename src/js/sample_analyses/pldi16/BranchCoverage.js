// do not remove the following comment
// JALANGI DO NOT INSTRUMENT

/**
 * @author  Koushik Sen
 *
 */

(function (sandbox) {
    var trueBranches = {};
    var falseBranches = {};

    function MyAnalysis() {

        this.conditional = function (iid, result) {
            var id = J$.getGlobalIID(iid);
            if (result)
                trueBranches[id] = (trueBranches[id]|0) + 1;
            else
                falseBranches[id] = (falseBranches[id]|0) + 1;
        };

        this.endExecution = function () {
            print(trueBranches, "True");
            print(falseBranches, "False");
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

    function print(map, str) {
        for (var id in map)
            if (map.hasOwnProperty(id)) {
                sandbox.log(str + " branch taken at " + J$.iidToLocation(id) + " " + map[id] + " times");
            }
    }

    sandbox.analysis = new MyAnalysis();
}(J$));

/*
node src/js/commands/jalangi.js --inlineIID --inlineSource --analysis src/js/sample_analyses/pldi16/BranchCoverage.js tests/pldi16/BranchCoverageTest.js
node src/js/commands/esnstrument_cli.js --inlineIID --inlineSource --analysis src/js/sample_analyses/pldi16/BranchCoverage.js --out /tmp/pldi16/BranchCoverageTest.html  tests/pldi16/BranchCoverageTest.html
node src/js/commands/esnstrument_cli.js --inlineIID --inlineSource --analysis src/js/sample_analyses/pldi16/BranchCoverage.js --out /tmp/pldi16/BranchCoverageTest.js  tests/pldi16/BranchCoverageTest.js
open file:///tmp/pldi16/BranchCoverageTest.html
*/
