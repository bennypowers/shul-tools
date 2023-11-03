'use strict';

module.exports = function(context) {
  return {

    DoWhileStatement(node) {
      context.report(node, 'do while loops are not allowed', { identifier: node.name });
    },

    ForStatement(node) {
      context.report(node, 'for loops are not allowed', { identifier: node.name });
    },

    ForInStatement(node) {
      context.report(node, 'for...in loops are not allowed', { identifier: node.name });
    },

    ForOfStatement(node) {
      if (node.body.type !== 'ExpressionStatement') {
        context.report(node, 'for...of loops may only have a single expression in their body', {
          identifier: node.name,
        });
      }
    },

    WhileStatement(node) {
      if (node.body.type !== 'ExpressionStatement') {
        context.report(node, 'while loops may only have a single expression in their body', {
          identifier: node.name,
        });
      }
    },

  };
};
