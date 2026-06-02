import type { RadarDimension } from './types';

export const TopGapsPanel = ({
    items,
    isGranularMode
}: {
    items: RadarDimension[];
    isGranularMode: boolean;
}) => {
    return (
        <div className="w-full lg:w-80 shrink-0">
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                {isGranularMode ? 'Top Skill Gaps' : 'Top Team Gaps'}
            </h4>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {isGranularMode ? 'Lowest average skills first.' : 'Lowest average categories first.'}
            </p>

            <div className="mt-4 space-y-3">
                {items.map((item, idx) => (
                    <div key={item.key} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 bg-slate-50/60 dark:bg-slate-800/40">
                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-xs font-black uppercase tracking-widest text-[#622F88] dark:text-purple-300">#{idx + 1} {item.label}</p>
                                {item.parentCategory && (
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{item.parentCategory}</p>
                                )}
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.skillsCount} components</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-slate-800 dark:text-slate-100">{item.scorePct.toFixed(1)}%</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400">avg capability</p>
                            </div>
                        </div>

                        <div className="mt-3">
                            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                <div className="h-full rounded-full bg-[#622F88]" style={{ width: `${item.scorePct}%` }}></div>
                            </div>
                            <p className="mt-2 text-[10px] font-semibold text-slate-500 dark:text-slate-400">Strong coverage (Experience+): {item.strongCoveragePct.toFixed(1)}%</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
