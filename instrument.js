const fs = require('fs');
const path = require('path');
const dst = path.join(__dirname, "optimized.js");

const src = process.argv[2];
const acorn = require('acorn');
const walk = require('acorn-walk');
const _ = require('lodash');
const escodegen = require('escodegen');

function oneScript(src) {
  const unused = JSON.parse(fs.readFileSync(path.join(__dirname, "unused.json")));
  console.log(unused);
  const jalangi_src = src.substring(0, src.lastIndexOf(".")) + src.substring(src.lastIndexOf("."));
  const jalangi_code = fs.readFileSync(jalangi_src).toString();
  const jalangi_ast = acorn.parse(jalangi_code);

  const unwrap = _.cloneDeep(walk.base);
  unwrap.CallExpression = function (node, st, c) {
    c(node.callee, st, "Expression");
    if (node.arguments) {
      for (var i = 0, list = node.arguments; i < list.length; i += 1) {
        var arg = list[i];

        c(arg, st, "Expression");
      }
    }
    if(node.callee.type === "MemberExpression" && node.callee.object.name === "J$") {
      const name = node.callee.property.name;
      const last = name[name.length - 1];
      const last2 = +name[name.length - 2];
      if((node.arguments.length > 0 && node.arguments[0].type === "Literal" && unused.includes(node.arguments[0].value)) || (last === "_" && !isNaN(last2))) {
        const methodName = node.callee.property.name;
        const copy = {};
        for (let key in node) {
          copy[key] = node[key];
          delete node[key];
        }
        switch (methodName) {
          case "Fe":
            node.type = "Literal";
            node.value = true;
            break;
          case "Fr":
            node.type = "Literal";
            node.value = false;
            break;
          case "F":
            if(copy.arguments[2].value !== 0) {
              node.type = "MemberExpression";
              node.object = {
                type: "Identifier",
                name: "J$"
              };
              node.property = {
                type: "Identifier",
                name: "F2_"
              };
              node.callee = {};
              for (let key in copy.arguments[1]) {
                node.callee[key] = copy.arguments[1][key];
              }
            } else {
              for (let key in copy.arguments[1]) {
                node[key] = copy.arguments[1][key];
              }
            }
            break;
          case "F2_":
            node.type = "NewExpression";
            node.callee = copy.callee.callee;
            node.arguments = copy.arguments;
            break;
          case "M":
            node.type = "MemberExpression";
            node.object = {};
            for (let key in copy.arguments[1]) {
              node.object[key] = copy.arguments[1][key];
            }
            node.computed = copy.arguments[3].value !== 0;
            node.property = {
              type: "Identifier",
              name: copy.arguments[2].value
            };
            break;
          case "A":
            node.type = "MemberExpression";
            node.object = {
              type: "Identifier",
              name: "J$"
            };
            node.property = {
              type: "Identifier",
              name: "A2_"
            };
            node.computed = false;

            node.operator = copy.arguments[3].value + "=";
            node.left = {
              type: "MemberExpression",
              object: {}
            };
            for (let key in copy.arguments[1]) {
              node.left.object[key] = copy.arguments[1][key];
            }
            node.left.computed = copy.arguments[4].value !== 0;
            node.left.property = {
              type: "Identifier",
              name: copy.arguments[2].value
            };
            break;
          case "A2_":
            node.type = "AssignmentExpression";
            node.operator = copy.callee.operator;
            node.left = copy.callee.left;
            node.right = {};
            for (let key in copy.arguments[0]) {
              node.right[key] = copy.arguments[0][key];
            }
            break;
          case "P":
            node.type = "AssignmentExpression";
            node.operator = "=";
            node.left = {
              type: "MemberExpression",
              object: {},
              property: {
                type: "Identifier",
                name: copy.arguments[2].value
              },
              computed: false
            };
            for (let key in copy.arguments[1]) {
              node.left.object[key] = copy.arguments[1][key];
            }
            node.right = {};
            for (let key in copy.arguments[3]) {
              node.right[key] = copy.arguments[3][key];
            }
            break;
          case "G":
            node.type = "MemberExpression"
            node.object = {};
            node.property = {
              type: "Identifier",
              name: copy.arguments[2].value
            };
            node.computed = copy.arguments[3].value !== 0;
            for (let key in copy.arguments[1]) {
              node.object[key] = copy.arguments[1][key];
            }
            break;
          case "Se":
            node.type = "Literal";
            node.value = true;
            break;
          case "Sr":
            node.type = "Literal";
            node.value = true;
            break;
          case "R":
            for (let key in copy.arguments[2]) {
              node[key] = copy.arguments[2][key];
            }
            break;
          case "W":
            for (let key in copy.arguments[2]) {
              node[key] = copy.arguments[2][key];
            }
            break;
          //TODO case "I":
          case "H":
            for (let key in copy.arguments[1]) {
              node[key] = copy.arguments[1][key];
            }
            break;
          case "T":
            for (let key in copy.arguments[1]) {
              node[key] = copy.arguments[1][key];
            }
            break;
          case "N":
            node.type = "Literal";
            node.value = true;
            break;
          case "Rt":
            for (let key in copy.arguments[1]) {
              node[key] = copy.arguments[1][key];
            }
            break;
          case "Th":
            for (let key in copy.arguments[1]) {
              node[key] = copy.arguments[1][key];
            }
            break;
          //case "Ra": // No iid
          case "Ex":
            node.type = "Literal";
            node.value = true;
            break;
          //case "L": // No iid
          //case "_tm_p": // var
          //TODO case "S":
          case "Wi":
            for (let key in copy.arguments[1]) {
              node[key] = copy.arguments[1][key];
            }
            break;
          case "B":
            node.type = "BinaryExpression";
            node.operator = copy.arguments[1].value;
            node.left = {};
            for (let key in copy.arguments[2]) {
              node.left[key] = copy.arguments[2][key];
            }
            node.right = {};
            for (let key in copy.arguments[3]) {
              node.right[key] = copy.arguments[3][key];
            }
            break;
          case "U":
            node.type = "UnaryExpression";
            node.operator = copy.arguments[1].value;
            node.argument = {};
            for (let key in copy.arguments[2]) {
              node.argument[key] = copy.arguments[2][key];
            }
            node.prefix = true;
            break;
          case "C":
          case "C1":
          case "C2":
          case "_":
          case "X1":
            for (let key in copy.arguments[1]) {
              node[key] = copy.arguments[1][key];
            }
            break;
          default:
            for (let key in copy) {
              node[key] = copy[key];
            }
            break;
        }
      }
    }
  };
  walk.simple(jalangi_ast, {}, unwrap);
  return escodegen.generate(jalangi_ast);
}

switch(path.extname(src).substring(1)) {
    case "js":
        let newCode = oneScript(src);
        fs.writeFileSync(dst, newCode);
        break;
}
