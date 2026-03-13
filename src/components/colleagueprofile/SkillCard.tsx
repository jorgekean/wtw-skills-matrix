import React from 'react';
import { type ProficiencyLevel, type SkillDetails } from '../../types/skills';
import { PROFICIENCY_LEVELS } from '../../data/skillsData';

interface SkillCardProps {
    skill: string;
    details: SkillDetails;
    onUpdateRating: (skill: string, rating: ProficiencyLevel) => void;
    onToggleHeart: (skill: string) => void;
}

export const SkillCard: React.FC<SkillCardProps> = ({ skill, details, onUpdateRating, onToggleHeart }) => {
    const { rating, interested, updatedOn } = details;

    const getActiveClasses = (level: ProficiencyLevel) => {
        if (rating !== level) return 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700 hover:-translate-y-[1px]';

        const baseActive = 'shadow-sm ring-1 ring-black/5 dark:ring-white/10 text-white border-transparent';
        switch (level) {
            case 'N/A': return `${baseActive} bg-slate-400`;
            case 'I': return `${baseActive} bg-indigo-400`;
            case 'L': return `${baseActive} bg-emerald-500`;
            case 'U': return `${baseActive} bg-[#622F88]`;
            case 'O': return `${baseActive} bg-slate-900 dark:bg-slate-50 dark:text-slate-900`;
            default: return '';
        }
    };

    const formattedDate = updatedOn ? new Date(updatedOn).toLocaleDateString() : '';

    return (
        <div className="p-5 rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-indigo-100 dark:hover:border-indigo-500/30 transition-all duration-300 flex flex-col justify-between gap-5 group">
            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-base tracking-tight leading-tight group-hover:text-wtw dark:group-hover:text-indigo-400 transition-colors">
                        {skill}
                    </span>
                    {updatedOn ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 w-fit">
                            Updated: {formattedDate}
                        </span>
                    ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/50 w-fit">
                            Pending Assessment
                        </span>
                    )}
                </div>
                <button
                    onClick={() => onToggleHeart(skill)}
                    className={`transition-all duration-200 hover:scale-110 active:scale-95 ${interested ? 'text-red-500 fill-current' : 'text-slate-300 dark:text-slate-600'
                        }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={interested ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>
            </div>

            <div className="flex justify-between gap-1 mt-2 bg-slate-50/50 dark:bg-slate-900/50 p-1.5 rounded-xl border border-slate-100 dark:border-slate-700">
                {PROFICIENCY_LEVELS.map(lv => (
                    <button
                        key={lv}
                        onClick={() => onUpdateRating(skill, lv)}
                        className={`flex-1 py-2 text-[11px] font-bold border border-transparent rounded-lg transition-all duration-200 ${getActiveClasses(lv)}`}
                    >
                        {lv}
                    </button>
                ))}
            </div>
        </div>
    );
};