import {useMemo} from 'preact/hooks';
import {useAppContext} from '../context/app';
import {CategoryTree} from './CategoryTree';

export function Sidebar() {
    const ctx = useAppContext();
    const originalDiffAddresses = useMemo(() => new Set(ctx.changes.map(change => change.param.address)), [ctx.changes]);

    return (
        <aside className={`w-full sm:w-80 flex flex-col bg-zinc-100 dark:bg-zinc-800 border-r border-zinc-300 dark:border-zinc-700 ${ctx.selectedParam ? 'hidden sm:flex' : 'flex'}`}>
            {ctx.definition ? (
                <>
                    <div className="flex justify-between px-4 py-3 border-b border-zinc-300 dark:border-zinc-700 font-semibold">
                        <span className="truncate">{ctx.definition.name}</span>
                        <span className="text-zinc-600 dark:text-zinc-400 font-normal shrink-0 ml-2">{ctx.definition.parameters.length}</span>
                    </div>
                    <CategoryTree
                    parameters={ctx.definition.parameters}
                    onSelect={ctx.setSelectedParam}
                    selectedParam={ctx.selectedParam}
                    originalDiffAddresses={originalDiffAddresses}
                />
            </>
        ) : (
            <div className="flex-1 flex flex-col justify-center items-center p-4 text-zinc-500 text-sm text-center">
                <p>No definition loaded</p>
                <p className="mt-2">Use "Load XDF" in the toolbar</p>
            </div>
        )}
        </aside>
    );
}
