node instrument.js tests/octane/deltablue_jalangi_.js
node src/js/commands/esnstrument_cli.js test.js
node src/js/commands/esnstrument_cli.js tests/octane/deltablue.js
node src/js/commands/jalangi.js --inlineIID --inlineSource --analysis src/js/sample_analyses/ChainedAnalyses.js --analysis src/js/sample_analyses/dlint/Utils.js --analysis src/js/sample_analyses/dlint/FunCalledWithMoreArguments.js tests/octane/deltablue.js
node src/js/commands/jalangi.js --inlineIID --inlineSource --analysis src/js/sample_analyses/ChainedAnalyses.js --analysis src/js/sample_analyses/dlint/Utils.js --analysis src/js/sample_analyses/dlint/CheckNaN.js --analysis src/js/sample_analyses/dlint/FunCalledWithMoreArguments.js --analysis src/js/sample_analyses/dlint/CompareFunctionWithPrimitives.js --analysis src/js/sample_analyses/dlint/ShadowProtoProperty.js --analysis src/js/sample_analyses/dlint/ConcatUndefinedToString.js --analysis src/js/sample_analyses/dlint/UndefinedOffset.js tests/octane/deltablue.js
