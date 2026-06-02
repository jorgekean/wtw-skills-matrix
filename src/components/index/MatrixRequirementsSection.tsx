import { GroupedMultiSelectDropdown } from './GroupedMultiSelectDropdown';
import type { MatrixView } from './types';

export const MatrixRequirementsSection = ({
    activeView,
    isLoadingData,
    currentSkillMap,
    selectedComponents,
    minLevel,
    isExactMatch,
    selectedRole,
    uniqueRoles,
    viewMode,
    levelLabels,
    onViewChange,
    onToggleComponent,
    onToggleCategory,
    onMinLevelChange,
    onExactMatchToggle,
    onRoleChange,
    onClearFilters,
    onViewModeChange
}: {
    activeView: MatrixView;
    isLoadingData: boolean;
    currentSkillMap: Record<string, string[]>;
    selectedComponents: string[];
    minLevel: number;
    isExactMatch: boolean;
    selectedRole: string;
    uniqueRoles: string[];
    viewMode: 'TABLE' | 'HEATMAP';
    levelLabels: string[];
    onViewChange: (view: MatrixView) => void;
    onToggleComponent: (skill: string) => void;
    onToggleCategory: (skills: string[]) => void;
    onMinLevelChange: (value: number) => void;
    onExactMatchToggle: () => void;
    onRoleChange: (role: string) => void;
    onClearFilters: () => void;
    onViewModeChange: (mode: 'TABLE' | 'HEATMAP') => void;
}) => {
    return (
        <section className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 z-40 relative">
            <div className="absolute top-0 left-0 w-1 bg-[#622F88] h-full"></div>
            <div className="max-w-[1920px] mx-auto px-6 py-4 flex flex-col gap-5">
                <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-700/50 pb-4">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active Matrix View</span>
                    <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl inline-flex shadow-inner">
                        <button onClick={() => onViewChange('BC')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeView === 'BC' ? 'bg-white dark:bg-slate-700 text-[#622F88] dark:text-purple-300 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>BC Components</button>
                        <button onClick={() => onViewChange('INTERNAL')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeView === 'INTERNAL' ? 'bg-white dark:bg-slate-700 text-[#622F88] dark:text-purple-300 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>Internal Initiatives</button>
                    </div>
                </div>

                <div className="flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-end">
                    <div className="flex flex-wrap gap-8 items-end flex-1 pl-2">
                        <div className="flex flex-col w-full xl:w-auto">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2 tracking-widest flex items-center gap-2">
                                Target {activeView === 'BC' ? 'Components' : 'Initiatives'}
                                {isLoadingData && <span className="animate-pulse text-purple-400">(Loading Dataverse...)</span>}
                            </label>
                            <GroupedMultiSelectDropdown groupedOptions={currentSkillMap} selected={selectedComponents} toggleOption={onToggleComponent} toggleCategory={onToggleCategory} />
                        </div>

                        <div className="flex flex-col w-full sm:w-72">
                            <div className="flex justify-between items-end mb-2">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Level</label>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[9px] font-bold transition-colors ${!isExactMatch ? 'text-[#622F88] dark:text-purple-400' : 'text-slate-400'}`}>Smart Match</span>
                                    <button onClick={onExactMatchToggle} className={`w-8 h-4 rounded-full transition-colors relative ${isExactMatch ? 'bg-[#622F88]' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                        <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${isExactMatch ? 'translate-x-4' : 'translate-x-1'}`}></div>
                                    </button>
                                    <span className={`text-[9px] font-bold transition-colors ${isExactMatch ? 'text-[#622F88] dark:text-purple-400' : 'text-slate-400'}`}>Exact</span>
                                </div>
                            </div>
                            <div className="relative pt-1">
                                <input type="range" min="0" max="6" step="1" value={minLevel} onChange={(e) => onMinLevelChange(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#622F88]" />
                                <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-2 px-1">
                                    {levelLabels.map((label, idx) => (
                                        <span key={label} className={minLevel === idx || (!isExactMatch && minLevel > 0 && idx >= minLevel) ? 'text-[#622F88] dark:text-purple-400' : ''}>{label}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-end gap-4 w-full xl:w-auto">
                        <div className="flex flex-col flex-1 sm:flex-none">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2 tracking-widest">Role Filter</label>
                            <select value={selectedRole} onChange={(e) => onRoleChange(e.target.value)} className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-[11px] font-bold text-[#622F88] dark:text-purple-300 outline-none w-full sm:w-36 appearance-none shadow-sm">
                                <option value="all" className="text-slate-700 dark:text-slate-200">Any Role</option>
                                {uniqueRoles.map(role => <option key={role} value={role}>{role}</option>)}
                            </select>
                        </div>

                        <button type="button" onClick={onClearFilters} className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl transition-all active:scale-95 shadow-sm h-[38px] w-full sm:w-auto">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            Clear
                        </button>

                        <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1 shadow-inner h-[38px]">
                            <button type="button" onClick={() => onViewModeChange('TABLE')} className={`flex items-center justify-center px-3 text-xs font-bold rounded-lg transition-all ${viewMode === 'TABLE' ? 'bg-white dark:bg-slate-800 text-[#622F88] dark:text-purple-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                                List
                            </button>
                            <button type="button" onClick={() => onViewModeChange('HEATMAP')} className={`flex items-center justify-center px-3 text-xs font-bold rounded-lg transition-all ${viewMode === 'HEATMAP' ? 'bg-white dark:bg-slate-800 text-[#622F88] dark:text-purple-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                Grid
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
