import type { MatrixView, Colleague, TeamGapAnalysisItem } from './types';

export const GapAnalysisModal = ({
    show,
    team,
    activeView,
    selectedComponents,
    minLevel,
    levelLabels,
    currentSkillMap,
    currentGapAnalysis,
    onClose
}: {
    show: boolean;
    team: Colleague[];
    activeView: MatrixView;
    selectedComponents: string[];
    minLevel: number;
    levelLabels: string[];
    currentSkillMap: Record<string, string[]>;
    currentGapAnalysis: TeamGapAnalysisItem[];
    onClose: () => void;
}) => {
    if (!show) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 opacity-100 transition-opacity">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700 transform transition-all scale-100">
                <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 shrink-0">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">Gap Analysis & Coverage Matrix</h2>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">
                            Evaluating {team.length} Team Members ({activeView === 'BC' ? 'BC Components' : 'Internal Initiatives'})
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {selectedComponents.length > 0 && (
                        <div className="mb-8 p-5 bg-[#EEF2FF] dark:bg-indigo-900/20 border border-[#C7D2FE] dark:border-indigo-800 rounded-2xl">
                            <h3 className="text-xs font-black text-indigo-800 dark:text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Project Targets
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedComponents.map(comp => (
                                    <div key={comp} className="flex items-center bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-slate-700 shadow-sm">
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 mr-2">{comp}</span>
                                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/50 px-2 py-0.5 rounded">
                                            Req: {minLevel === 0 ? 'Any' : levelLabels[minLevel]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-10">
                        {Object.entries(currentSkillMap).map(([subCat, skills]) => {
                            const relevantGaps = currentGapAnalysis.filter(g => skills.includes(g.skill));
                            const hasTargetsInCategory = relevantGaps.some(g => g.isTargeted);
                            if (selectedComponents.length > 0 && !hasTargetsInCategory) return null;
                            if (relevantGaps.length === 0) return null;

                            return (
                                <div key={subCat}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">{subCat}</h3>
                                        <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {relevantGaps.sort((a, b) => (a.isTargeted === b.isTargeted) ? 0 : a.isTargeted ? -1 : 1).map((item) => (
                                            <div key={item.skill} className={`p-5 rounded-2xl border shadow-sm flex flex-col gap-4 relative overflow-hidden transition-all ${item.isTargeted && item.overallGap ? 'bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-900/50 ring-1 ring-red-500/20' : item.isTargeted ? 'bg-white dark:bg-slate-800 border-[#622F88]/30 dark:border-purple-500/30 ring-1 ring-[#622F88]/10' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                                                {item.isTargeted && (
                                                    <div className={`absolute top-0 right-0 px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-bl-lg ${item.overallGap ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                                                        {item.overallGap ? 'GAP DETECTED' : 'COVERED'}
                                                    </div>
                                                )}
                                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center gap-2">{item.skill}</h4>
                                                <div className="flex flex-col gap-4 mt-1">
                                                    {item.roleBreakdown.map(rc => (
                                                        <div key={rc.role} className="flex items-start gap-3">
                                                            <span className="w-16 shrink-0 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5 truncate" title={rc.role}>{rc.role}</span>
                                                            <div className="flex-1 flex flex-col gap-1.5">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex-1 flex gap-1 h-2 opacity-90">
                                                                        {[1, 2, 3, 4, 5].map(segment => {
                                                                            let color = 'bg-slate-100 dark:bg-slate-700';
                                                                            if (rc.maxWeight >= segment) {
                                                                                color = rc.maxWeight >= 4 ? 'bg-emerald-400' : rc.maxWeight >= 2 ? 'bg-[#622F88] dark:bg-purple-500' : 'bg-amber-400';
                                                                            }
                                                                            return <div key={segment} className={`flex-1 rounded-sm transition-colors duration-500 ${color}`}></div>;
                                                                        })}
                                                                    </div>
                                                                    <span className={`w-14 text-right text-[10px] font-black ${rc.maxWeight >= 4 ? 'text-emerald-500' : rc.maxWeight === 0 || rc.maxWeight === 1 ? 'text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                                                        {rc.topLevelStr === 'Missing' ? 'N/A' : rc.topLevelStr}
                                                                    </span>
                                                                </div>
                                                                <div className="min-h-4">
                                                                    {rc.experts.length > 0 ? (
                                                                        <div className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 line-clamp-1">Experts: <span className="text-slate-600 dark:text-slate-300">{rc.experts.join(', ')}</span></div>
                                                                    ) : (item.isTargeted && rc.hasGap) ? (
                                                                        <div className="text-[9px] font-bold text-red-500/80 dark:text-red-400/80">Role does not meet target ({item.targetStr})</div>
                                                                    ) : null}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
