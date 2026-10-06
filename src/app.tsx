import {useState, useCallback, useEffect} from 'preact/hooks';
import type {Definition} from './types';
import {XdfLoader} from './components/XdfLoader';
import {Modal} from './components/Modal';
import {MenuBar} from './components/MenuBar';
import {Sidebar} from './components/Sidebar';
import {MainArea} from './components/MainArea';
import {ChangesModal} from './components/ChangesModal';
import {AppContext} from './context/app';
import {useAppState} from './hooks/useAppState';
import {XDFParser} from './lib/xdfParser';
import './app.css';

const BIN_EXTENSIONS = ['.bin', '.ori', '.mod'];

function classifyFile(name: string): 'bin' | 'xdf' | null {
    const lower = name.toLowerCase();
    if (lower.endsWith('.xdf')) return 'xdf';
    if (BIN_EXTENSIONS.some(ext => lower.endsWith(ext))) return 'bin';
    return null;
}

export function App() {
    const appState = useAppState();

    // Warn before closing with unsaved changes
    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (appState.modified) {
                e.preventDefault();
            }
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [appState.modified]);

    const [showXdfLoader, setShowXdfLoader] = useState(false);
    const [showChanges, setShowChanges] = useState(false);

    const handleDefinitionLoad = useCallback((def: Definition) => {
        appState.setExternalDefinition(def);
        appState.setSelectedParam(null);
        setShowXdfLoader(false);
    }, [appState]);

    // Global drag & drop — routes by file type
    const handleGlobalDrop = useCallback(async (e: DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer?.files[0];
        if (!file) return;

        const type = classifyFile(file.name);
        if (type === 'xdf') {
            const parser = new XDFParser();
            await parser.parseXDF(file);
            const def = parser.generateDefinition();
            appState.setExternalDefinition(def);
            appState.setSelectedParam(null);
        } else if (type === 'bin') {
            await appState.loadBin(file);
        }
    }, [appState]);

    const preventDefaults = useCallback((e: DragEvent) => {
        e.preventDefault();
    }, []);

    return (
        <AppContext.Provider value={appState}>
            <div
                class="flex flex-col h-screen bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                onDragOver={preventDefaults}
                onDrop={handleGlobalDrop}
            >
                <MenuBar
                    onShowXdfLoader={() => setShowXdfLoader(true)}
                    onShowChanges={() => setShowChanges(true)}
                />
                <div class="flex flex-1 overflow-hidden">
                    <Sidebar/>
                    <MainArea/>
                </div>

                {showXdfLoader && (
                    <Modal title="Load XDF definition" onClose={() => setShowXdfLoader(false)} width="lg">
                        <XdfLoader onDefinitionLoad={handleDefinitionLoad}/>
                    </Modal>
                )}

                {showChanges && (
                    <ChangesModal onClose={() => setShowChanges(false)}/>
                )}
            </div>
        </AppContext.Provider>
    );
}
