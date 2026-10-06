import {useState, useCallback, useMemo} from 'preact/hooks';
import {DATA_TYPE_INFO, ILoadedBin} from '../types';
import type {Definition, IDefinitionParameter, CellDiff, AxisDiff, ParamDiff} from '../types';
import {
    readParameterValue,
    readTableData,
    readAxisData,
} from '../lib/binUtils';
import type {IAppContext} from '../context/app';

export function useAppState(): IAppContext {
    //Memory state for the application
    const [definition, setDefinition] = useState<Definition | null>(null);
    const [binData, setBinData] = useState<Uint8Array | null>(null);
    const [binFileName, setBinFileName] = useState<string | null>(null);
    const [originalBinData, setOriginalBinData] = useState<Uint8Array | null>(null);
    const [originalBinFileName, setOriginalBinFileName] = useState<string | null>(null);
    const [selectedParam, setSelectedParam] = useState<IDefinitionParameter | null>(null);
    const [modified, setModified] = useState(false);
    const [modRevision, setModRevision] = useState(0);
    const calOffset = 0;

    // Derived
    const bigEndian = definition?.bigEndian ?? false;

    // ILoadedBin wrappers
    const bin: ILoadedBin | null = binData ? {
        name: binFileName ?? '',
        data: binData,
        modified,
    } : null;

    const originalBin: ILoadedBin | null = originalBinData ? {
        name: originalBinFileName ?? '',
        data: originalBinData,
    } : null;

    const markModified = useCallback(() => {
        setModified(true);
        setModRevision(r => r + 1);
    }, []);

    const markSaved = useCallback(() => {
        setModified(false);
    }, []);

    const loadBin = useCallback(async (file: File) => {
        const buffer = await file.arrayBuffer();
        const data = new Uint8Array(buffer);
        setBinData(data);
        setBinFileName(file.name);
        setModified(false);
    }, []);

    const loadBinData = useCallback((data: Uint8Array, name: string) => {
        setBinData(data);
        setBinFileName(name);
        setModified(false);
    }, []);


    const loadOriginalBin = useCallback(async (file: File) => {
        const buffer = await file.arrayBuffer();
        setOriginalBinData(new Uint8Array(buffer));
        setOriginalBinFileName(file.name);
    }, []);

    const setExternalDefinition = useCallback((def: Definition | null) => {
        setDefinition(def);
    }, []);

    const saveBin = useCallback((filename?: string) => {
        if (!binData || !binFileName) return;

        const downloadName = filename || binFileName.replace(/\.[^.]+$/, '_mod.bin');
        const blob = new Blob([binData.buffer as ArrayBuffer], {type: 'application/octet-stream'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = downloadName;
        a.click();
        URL.revokeObjectURL(url);

        setModified(false);
    }, [binData, binFileName]);

    // Calculate differences between original and current BIN
    const changes = useMemo((): ParamDiff[] => {
        if (!definition || !binData || !originalBinData) return [];

        const diffs: ParamDiff[] = [];
        const defBigEndian = definition.bigEndian ?? false;

        for (const param of definition.parameters) {
            if (param.type === 'VALUE') {
                const originalValue = readParameterValue(originalBinData, param, calOffset, defBigEndian);
                const currentValue = readParameterValue(binData, param, calOffset, defBigEndian);
                if (Math.abs(originalValue - currentValue) > 0.0001) {
                    diffs.push({param, originalValue, currentValue});
                }
            } else {
                const originalTable = readTableData(originalBinData, param, calOffset, defBigEndian);
                const currentTable = readTableData(binData, param, calOffset, defBigEndian);
                const cellDiffs: CellDiff[] = [];

                for (let r = 0; r < originalTable.length; r++) {
                    for (let c = 0; c < originalTable[r].length; c++) {
                        if (Math.abs(originalTable[r][c] - currentTable[r][c]) > 0.0001) {
                            cellDiffs.push({
                                row: r,
                                col: c,
                                original: originalTable[r][c],
                                current: currentTable[r][c],
                            });
                        }
                    }
                }

                const axisDiffs: AxisDiff[] = [];

                if (param.xAxis?.address) {
                    const originalXAxis = readAxisData(originalBinData, param.xAxis, calOffset, defBigEndian);
                    const currentXAxis = readAxisData(binData, param.xAxis, calOffset, defBigEndian);
                    const changedIndices: number[] = [];
                    for (let i = 0; i < originalXAxis.length; i++) {
                        if (Math.abs(originalXAxis[i] - currentXAxis[i]) > 0.0001) {
                            changedIndices.push(i);
                        }
                    }
                    if (changedIndices.length > 0) {
                        axisDiffs.push({axis: 'x', original: originalXAxis, current: currentXAxis, changedIndices});
                    }
                }

                if (param.yAxis?.address) {
                    const originalYAxis = readAxisData(originalBinData, param.yAxis, calOffset, defBigEndian);
                    const currentYAxis = readAxisData(binData, param.yAxis, calOffset, defBigEndian);
                    const changedIndices: number[] = [];
                    for (let i = 0; i < originalYAxis.length; i++) {
                        if (Math.abs(originalYAxis[i] - currentYAxis[i]) > 0.0001) {
                            changedIndices.push(i);
                        }
                    }
                    if (changedIndices.length > 0) {
                        axisDiffs.push({axis: 'y', original: originalYAxis, current: currentYAxis, changedIndices});
                    }
                }

                if (cellDiffs.length > 0 || axisDiffs.length > 0) {
                    const xAxis = param.xAxis ? readAxisData(binData, param.xAxis, calOffset, defBigEndian) : undefined;
                    const yAxis = param.yAxis ? readAxisData(binData, param.yAxis, calOffset, defBigEndian) : undefined;

                    diffs.push({
                        param,
                        originalValue: originalTable,
                        currentValue: currentTable,
                        cellDiffs,
                        axisDiffs,
                        xAxis,
                        yAxis,
                    });
                }
            }
        }

        return diffs;
    }, [definition, binData, originalBinData, calOffset, modRevision]);

    return {
        bin,
        originalBin,
        definition,
        selectedParam,
        calOffset,
        bigEndian,
        modified,
        changes,
        loadBin,
        loadBinData,
        loadOriginalBin,
        saveBin,
        binFileName,
        markModified,
        markSaved,
        setDefinition,
        setExternalDefinition,
        setSelectedParam,
    };
}
