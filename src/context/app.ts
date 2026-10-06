import {createContext} from "preact";
import {useContext} from "preact/hooks";
import type {Definition, IDefinitionParameter, ILoadedBin, ParamDiff} from "../types";

export interface IAppContext {
    // Binary
    bin: ILoadedBin | null;
    originalBin: ILoadedBin | null;

    // Definition
    definition: Definition | null;
    selectedParam: IDefinitionParameter | null;
    calOffset: number;

    // Derived
    bigEndian: boolean;
    modified: boolean;

    // Computed
    changes: ParamDiff[];

    // Actions
    loadBin: (file: File) => Promise<void>;
    loadBinData: (data: Uint8Array, name: string) => void;
    loadOriginalBin: (file: File) => Promise<void>;
    saveBin: (filename?: string) => void;
    binFileName: string | null;
    markModified: () => void;
    markSaved: () => void;
    setDefinition: (def: Definition | null) => void;
    setExternalDefinition: (def: Definition | null) => void;
    setSelectedParam: (param: IDefinitionParameter | null) => void;
}

export const AppContext = createContext<IAppContext | null>(null);

export function useAppContext(): IAppContext {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("useAppContext must be used within AppContext.Provider");
    return ctx;
}
