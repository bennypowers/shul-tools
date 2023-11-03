import { ModuleFile } from '../module';
import { Position } from '../system';
export interface ModuleSlice {
    moduleFile: ModuleFile;
    firstSourceFileStart: number;
    wrapperPos?: Position;
    bodyPos: Position;
    fileEnd: number;
    sourceFileStarts: [name: string, position: number][];
}
export declare function sliceModule(moduleFile: ModuleFile, tsVersion: string): ModuleSlice;
/** @internal */
export declare namespace ModuleSlice {
    const createError: (msg?: string) => Error;
}
