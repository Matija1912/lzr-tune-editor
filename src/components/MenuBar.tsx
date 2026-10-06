import {useCallback, useRef, useState} from 'preact/hooks';
import {useAppContext} from '../context/app';
import {Modal} from './Modal';

const APP_VERSION = __APP_VERSION__;

interface MenuBarProps {
    onShowXdfLoader: () => void;
    onShowChanges: () => void;
}

export function MenuBar({onShowXdfLoader, onShowChanges}: MenuBarProps) {
    const ctx = useAppContext();
    const [showFileMenu, setShowFileMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showAbout, setShowAbout] = useState(false);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [saveFileName, setSaveFileName] = useState('');

    const binInputRef = useRef<HTMLInputElement>(null);
    const originalBinInputRef = useRef<HTMLInputElement>(null);

    const closeMenus = useCallback(() => {
        setShowFileMenu(false);
        setShowMobileMenu(false);
    }, []);

    const handleOpenBin = useCallback(async () => {
        const file = binInputRef.current?.files?.[0];
        if (!file) return;
        await ctx.loadBin(file);
        closeMenus();
        if (binInputRef.current) binInputRef.current.value = '';
    }, [closeMenus, ctx]);

    const handleOpenOriginalBin = useCallback(async () => {
        const file = originalBinInputRef.current?.files?.[0];
        if (!file) return;
        await ctx.loadOriginalBin(file);
        closeMenus();
        if (originalBinInputRef.current) originalBinInputRef.current.value = '';
    }, [closeMenus, ctx]);

    const handleSaveBin = useCallback(() => {
        setSaveFileName(ctx.binFileName?.replace(/\.[^.]+$/, '_mod.bin') ?? 'output.bin');
        setShowSaveDialog(true);
        closeMenus();
    }, [closeMenus, ctx.binFileName]);

    const handleSaveConfirm = useCallback(() => {
        ctx.saveBin(saveFileName);
        setShowSaveDialog(false);
    }, [ctx, saveFileName]);

    const mobileAction = (action: () => void) => () => {
        action();
        setShowMobileMenu(false);
    };

    const fileActions = (
        <>
            <label class="block px-3 py-2 text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer">
                Open BIN…
                <input type="file" accept=".bin,.ori,.mod" ref={binInputRef} onChange={handleOpenBin} class="hidden"/>
            </label>
            <div class="border-t border-zinc-300 dark:border-zinc-700 my-1"/>
            <label class="block px-3 py-2 text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer">
                Open original BIN…
                <input type="file" accept=".bin,.ori,.mod" ref={originalBinInputRef} onChange={handleOpenOriginalBin} class="hidden"/>
            </label>
            <div class="border-t border-zinc-300 dark:border-zinc-700 my-1"/>
            <button
                onClick={handleSaveBin}
                disabled={!ctx.bin}
                class="w-full text-left px-3 py-2 text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer disabled:text-zinc-500"
            >
                Save BIN…
            </button>
        </>
    );

    const statusBadges = ctx.bin && (
        <div class="flex items-center gap-1.5 flex-wrap min-w-0">
            <span class="font-mono text-xs text-zinc-600 dark:text-zinc-400 truncate max-w-60 sm:text-sm">{ctx.bin.name}</span>
            {ctx.bin.modified && (
                <span class="px-1.5 py-0.5 bg-amber-500 text-black rounded text-xs font-semibold">Modified</span>
            )}
        </div>
    );

    return (
        <header class="flex items-center gap-1 px-1 py-1 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-300 dark:border-zinc-700">
            <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                class="sm:hidden px-2 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
                aria-label="Menu"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
            </button>

            <div class="hidden sm:flex items-center flex-wrap gap-1">
                <div class="relative">
                    <button
                        onClick={() => setShowFileMenu(!showFileMenu)}
                        class={`px-3 py-1 text-sm rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer ${showFileMenu ? 'bg-zinc-200 dark:bg-zinc-700' : ''}`}
                    >
                        File
                    </button>
                    {showFileMenu && (
                        <>
                            <div class="fixed inset-0 z-10" onClick={() => setShowFileMenu(false)}/>
                            <div class="absolute left-0 top-full mt-1 w-56 bg-zinc-100 dark:bg-zinc-800 border border-zinc-400 dark:border-zinc-600 rounded shadow-lg z-20">
                                {fileActions}
                            </div>
                        </>
                    )}
                </div>
                <button onClick={onShowXdfLoader} class="px-3 py-1 text-sm rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer">Load XDF</button>
                {ctx.originalBin && ctx.bin && (
                    <button onClick={onShowChanges} class="px-3 py-1 text-sm rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer">
                        Changes ({ctx.changes.length})
                    </button>
                )}
                <button onClick={() => setShowAbout(true)} class="px-3 py-1 text-sm rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer">About</button>
            </div>

            <div class="flex-1 min-w-0 flex justify-end">{statusBadges}</div>

            {showMobileMenu && (
                <>
                    <div class="fixed inset-0 z-20 bg-black/30 sm:hidden" onClick={() => setShowMobileMenu(false)}/>
                    <div class="fixed left-0 top-0 bottom-0 z-30 w-72 max-w-[85vw] overflow-y-auto bg-zinc-100 dark:bg-zinc-800 border-r border-zinc-300 dark:border-zinc-700 shadow-xl sm:hidden">
                        <div class="flex items-center justify-between px-4 py-3 border-b border-zinc-300 dark:border-zinc-700">
                            <span class="font-semibold">Tune Editor</span>
                            <button onClick={() => setShowMobileMenu(false)} class="p-1 text-xl">×</button>
                        </div>
                        <div class="py-1">{fileActions}</div>
                        <div class="border-t border-zinc-300 dark:border-zinc-700 my-1"/>
                        <button onClick={mobileAction(onShowXdfLoader)} class="w-full text-left px-4 py-3 text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700">Load XDF definition</button>
                        {ctx.originalBin && ctx.bin && (
                            <button onClick={mobileAction(onShowChanges)} class="w-full text-left px-4 py-3 text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700">
                                Changes ({ctx.changes.length})
                            </button>
                        )}
                        <div class="border-t border-zinc-300 dark:border-zinc-700 my-1"/>
                        <button onClick={mobileAction(() => setShowAbout(true))} class="w-full text-left px-4 py-3 text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700">About</button>
                    </div>
                </>
            )}

            {showSaveDialog && (
                <Modal
                    title="Save BIN"
                    onClose={() => setShowSaveDialog(false)}
                    width="sm"
                    footer={
                        <div class="flex justify-end gap-2">
                            <button onClick={() => setShowSaveDialog(false)} class="px-4 py-2 text-sm rounded bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600">Cancel</button>
                            <button onClick={handleSaveConfirm} class="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700">Save</button>
                        </div>
                    }
                >
                    <div class="space-y-2">
                        <label class="block text-sm font-medium">Filename</label>
                        <input
                            type="text"
                            value={saveFileName}
                            onInput={event => setSaveFileName((event.target as HTMLInputElement).value)}
                            onKeyDown={event => { if (event.key === 'Enter') handleSaveConfirm(); }}
                            class="w-full px-3 py-2 text-sm rounded border border-zinc-400 dark:border-zinc-600 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                            autoFocus
                        />
                    </div>
                </Modal>
            )}

            {showAbout && (
                <Modal title="About" onClose={() => setShowAbout(false)} width="sm">
                    <div class="flex flex-col items-center gap-4 py-4 text-center">
                        <img src="logo.svg" alt="Tune Editor" class="w-16 h-16"/>
                        <div>
                            <div class="text-lg font-semibold">Tune Editor</div>
                            <div class="text-sm text-zinc-500">v{APP_VERSION}</div>
                        </div>
                    </div>
                </Modal>
            )}
        </header>
    );
}
