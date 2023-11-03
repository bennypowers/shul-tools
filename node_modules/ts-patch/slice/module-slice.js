"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleSlice = exports.sliceModule = void 0;
const semver_1 = __importDefault(require("semver"));
const ts5_1 = require("./ts5");
// endregion
/* ****************************************************************************************************************** */
// region: Utils
/* ****************************************************************************************************************** */
function sliceModule(moduleFile, tsVersion) {
    if (semver_1.default.lte(tsVersion, '5.0.0')) {
        throw new Error(`Cannot patch TS version <5`);
    }
    /* Handle 5+ */
    return (0, ts5_1.sliceTs5)(moduleFile);
}
exports.sliceModule = sliceModule;
/** @internal */
var ModuleSlice;
(function (ModuleSlice) {
    ModuleSlice.createError = (msg) => new Error(`Could not recognize TS format during slice!` + (msg ? ` — ${msg}` : ''));
})(ModuleSlice || (exports.ModuleSlice = ModuleSlice = {}));
// endregion
//# sourceMappingURL=module-slice.js.map