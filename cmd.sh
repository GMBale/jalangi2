node experiments/tmp/deltablue.js
node src/js/commands/esnstrument_cli.js --inlineIID experiments/tmp/deltablue.js
node src/js/commands/jalangi.js --analysis src/js/sample_analyses/ChainedAnalyses.js --analysis src/js/sample_analyses/dlint/Utils.js --analysis src/js/sample_analyses/opt/Utils.js --analysis src/js/sample_analyses/opt/RuntimeDB.js --analysis src/js/sample_analyses/dlint/FunCalledWithMoreArguments.js experiments/tmp/deltablue_jalangi_.js
node src/js/commands/esnstrument_cli.js --inlineIID --used used.json --iidMap experiments/tmp/deltablue_jalangi_.json --out optimized.js experiments/tmp/deltablue.js
node src/js/commands/jalangi.js --analysis src/js/sample_analyses/ChainedAnalyses.js --analysis src/js/sample_analyses/dlint/Utils.js --analysis src/js/sample_analyses/opt/Utils.js --analysis src/js/sample_analyses/opt/RuntimeDB.js --analysis src/js/sample_analyses/dlint/FunCalledWithMoreArguments.js optimized.js
