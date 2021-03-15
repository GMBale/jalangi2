node src/js/commands/esnstrument_cli.js tests/octane/deltablue.js --inlineIID --inlineSource
time node src/js/commands/direct.js --analysis src/js/sample_analyses/ChainedAnalyses.js --analysis src/js/sample_analyses/dlint/Utils.js --analysis src/js/sample_analyses/dlint/FunCalledWithMoreArguments.js tests/octane/deltablue_jalangi_.js
cp unused.json tmp.json
node instrument.js tests/octane/deltablue_jalangi_.js
time node src/js/commands/direct.js --analysis src/js/sample_analyses/ChainedAnalyses.js --analysis src/js/sample_analyses/dlint/Utils.js --analysis src/js/sample_analyses/dlint/FunCalledWithMoreArguments.js optimized.js
