export const TeamRadarHeader = ({ isGranularMode }: { isGranularMode: boolean }) => {
    return (
        <>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                {isGranularMode ? 'Team Capability Detail' : 'Team Capability By Category'}
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {isGranularMode
                    ? 'Showing skill-level detail because only 1-2 categories are selected.'
                    : 'Average team proficiency normalized from N/A (0%) to Consulting (100%).'}
            </p>

            <p className="mt-2 text-[10px] font-semibold text-slate-600 dark:text-slate-300 text-left">
                <span className="font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mr-2">Legend</span>
                Avg = team proficiency from 0% (N/A) to 100% (Consulting). Strong = % of ratings at Experience, Expert, or Consulting.
            </p>
        </>
    );
};
