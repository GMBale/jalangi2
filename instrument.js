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
    if(node.callee.type === "MemberExpression" && node.callee.object.name === "J$" && node.arguments.length > 0 && node.arguments[0].type === "Literal" && unused.includes(node.arguments[0].value)) {
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
          for (let key in copy.arguments[1]) {
            node[key] = copy.arguments[1][key];
          }
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
            name: "A2"
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
        case "A2":
          node.type = "AssignmentExpression";
          node.operator = copy.callee.operator;
          node.left = copy.callee.left;
          node.right = {};
          for (let key in copy.arguments[0]) {
            node.left.object[key] = copy.arguments[0][key];
          }
          break;
        default:
          for (let key in copy) {
            node[key] = copy[key];
          }
          break;
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
