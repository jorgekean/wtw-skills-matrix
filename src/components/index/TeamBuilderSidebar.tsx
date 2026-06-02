import type { Colleague } from './types';

export const TeamBuilderSidebar = ({
    team,
    onToggleTeamMember,
    onClearTeam,
    onAnalyze
}: {
    team: Colleague[];
    onToggleTeamMember: (member: Colleague) => void;
    onClearTeam: () => void;
    onAnalyze: () => void;
}) => {
    if (team.length === 0) {
        return null;
    }

    return (
        <div className="absolute right-0 top-0 bottom-0 w-[320px] xl:relative xl:w-80 bg-slate-50 dark:bg-slate-800/80 border-l border-slate-200 dark:border-slate-700 p-6 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)] overflow-y-auto z-20 transition-transform flex flex-col">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-50 dark:bg-slate-800 z-10 pb-2 shrink-0">
                <div>
                    <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">Team Builder</h2>
                    <p className="text-xs text-slate-500 mt-1">{team.length} {team.length === 1 ? 'Member' : 'Members'} Selected</p>
                </div>
                <button onClick={onClearTeam} className="text-[10px] font-bold text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded">Clear</button>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto flex-1 pb-6">
                {team.map(member => (
                    <div key={member.name} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative group shrink-0">
                        <button onClick={() => onToggleTeamMember(member)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100" title="Remove">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <div className="font-bold text-sm text-slate-800 dark:text-slate-100">{member.name}</div>
                        <div className="text-[10px] font-black text-[#622F88] dark:text-purple-400 tracking-widest uppercase mb-2">{member.role}</div>
                    </div>
                ))}
            </div>

            <div className="shrink-0 pt-4 bg-slate-50 dark:bg-slate-800 sticky bottom-0">
                <button onClick={onAnalyze} className="w-full py-3.5 rounded-xl bg-[#622F88] hover:bg-[#4C1D95] text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    Analyze Gap Coverage
                </button>
            </div>
        </div>
    );
};
