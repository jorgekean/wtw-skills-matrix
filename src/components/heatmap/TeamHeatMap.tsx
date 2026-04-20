const HEAT_MAP_COLORS: Record<string, string> = {
    'N/A': 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
    'Potential': 'bg-purple-200 dark:bg-purple-900/40 border-purple-300 dark:border-purple-800',
    'Exposure': 'bg-purple-400 dark:bg-purple-700/60 border-purple-500 dark:border-purple-600',
    'Experience': 'bg-purple-600 dark:bg-purple-600 border-purple-700 dark:border-purple-500',
    'Expert': 'bg-[#622F88] border-[#4C1D95]', // Your brand core
    'Consulting': 'bg-slate-900 dark:bg-slate-100 border-black dark:border-white' // The ultimate level
};

const TeamHeatMap = ({ colleagues, skills }: { colleagues: any[], skills: string[] }) => {
    if (skills.length === 0 || colleagues.length === 0) {
        return <div className="p-8 text-center text-slate-400">Select skills and search colleagues to generate the heat map.</div>;
    }

    return (
        <div className="overflow-auto max-h-[60vh] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm relative">
            <table className="w-full border-collapse text-left">
                <thead className="sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-20 shadow-sm">
                    <tr>
                        {/* Sticky Top-Left Corner */}
                        <th className="p-4 sticky left-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-30 border-b border-r border-slate-200 dark:border-slate-700 w-48 min-w-[12rem]">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Colleague</span>
                        </th>
                        {/* Skill Columns */}
                        {skills.map(skill => (
                            <th key={skill} className="p-4 border-b border-slate-200 dark:border-slate-700 min-w-[100px]">
                                <div className="writing-vertical-rl transform rotate-180 text-xs font-bold text-slate-700 dark:text-slate-300 max-h-32 overflow-hidden text-ellipsis whitespace-nowrap">
                                    {skill}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {colleagues.map(c => (
                        <tr key={c.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            {/* Sticky Left Column (Names) */}
                            <td className="p-4 sticky left-0 bg-white dark:bg-slate-900 z-10 border-r border-b border-slate-100 dark:border-slate-800">
                                <div className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate" title={c.name}>{c.name}</div>
                                <div className="text-[10px] text-[#622F88] font-black uppercase tracking-widest">{c.role}</div>
                            </td>

                            {/* Heat Map Cells */}
                            {skills.map(skill => {
                                const level = c.matrix[skill] || 'N/A';
                                const colorClass = HEAT_MAP_COLORS[level];

                                return (
                                    <td key={`${c.name}-${skill}`} className="p-1.5 border-b border-slate-100 dark:border-slate-800 text-center">
                                        <div
                                            className={`w-full h-8 sm:h-10 rounded-md border transition-all hover:scale-110 hover:shadow-md cursor-pointer ${colorClass}`}
                                            title={`${c.name} • ${skill}: ${level}`}
                                        >
                                            {/* Optional: Show tiny initial if you want it readable without hovering */}
                                            {level !== 'N/A' && (
                                                <span className="text-[9px] font-bold text-white/80 uppercase flex items-center justify-center h-full opacity-0 hover:opacity-100 transition-opacity">
                                                    {level.charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};