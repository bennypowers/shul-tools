"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addOriginalCreateProgramTransformer = void 0;
const typescript_1 = __importDefault(require("typescript"));
/* ****************************************************************************************************************** */
// region: Utils
/* ****************************************************************************************************************** */
function addOriginalCreateProgramTransformer(context) {
    const { factory } = context;
    let patchSuccess = false;
    return (sourceFile) => {
        if (sourceFile.fileName !== 'src/typescript/_namespaces/ts.ts')
            throw new Error('Wrong emitter file sent to transformer! This should be unreachable.');
        const res = factory.updateSourceFile(sourceFile, typescript_1.default.visitNodes(sourceFile.statements, visitNodes));
        if (!patchSuccess)
            throw new Error('Failed to patch typescript early return!');
        return res;
        function visitNodes(node) {
            if (typescript_1.default.isExpressionStatement(node) &&
                typescript_1.default.isCallExpression(node.expression) &&
                node.expression.expression.getText() === "__export") {
                const exportObjectLiteral = node.expression.arguments[1];
                if (typescript_1.default.isObjectLiteralExpression(exportObjectLiteral)) {
                    const originalCreateProgramProperty = factory.createPropertyAssignment("originalCreateProgram", factory.createArrowFunction(undefined, undefined, [], undefined, factory.createToken(typescript_1.default.SyntaxKind.EqualsGreaterThanToken), factory.createIdentifier("originalCreateProgram")));
                    const updatedExportObjectLiteral = factory.updateObjectLiteralExpression(exportObjectLiteral, [...exportObjectLiteral.properties, originalCreateProgramProperty]);
                    const updatedNode = factory.updateExpressionStatement(node, factory.updateCallExpression(node.expression, node.expression.expression, undefined, [node.expression.arguments[0], updatedExportObjectLiteral]));
                    patchSuccess = true;
                    return updatedNode;
                }
            }
            return node;
        }
    };
}
exports.addOriginalCreateProgramTransformer = addOriginalCreateProgramTransformer;
// endregion
//# sourceMappingURL=add-original-create-program.js.map