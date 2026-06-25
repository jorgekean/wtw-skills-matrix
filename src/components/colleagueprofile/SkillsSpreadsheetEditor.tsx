import React, { useMemo } from 'react';
import { type ProficiencyLevel } from '../../types/skills';
import { PROFICIENCY_LEVELS } from '../../data/skillsData';

type EditableSkillState = {
    rating?: ProficiencyLevel | null;
    interested?: boolean;
    updatedOn?: string | null;
};

interface SkillsSpreadsheetEditorProps {
    activeCategory: string;
    activeSubcategories: Record<string, string[]>;
    userSkills: Record<string, EditableSkillState>;
    onUpdateRating: (skill: string, rating: ProficiencyLevel) => void;
    onToggleHeart: (skill: string) => void;
    onBulkUpdate: (skills: string[], rating: ProficiencyLevel) => void;
}

export const SkillsSpreadsheetEditor: React.FC<SkillsSpreadsheetEditorProps> = ({
    activeCategory,
    activeSubcategories,
    userSkills,
    onUpdateRating,
    onToggleHeart,
    onBulkUpdate
}) => {
    const sortedSubcategories = useMemo(
        () => Object.keys(activeSubcategories).sort((a, b) => (a === 'General' ? -1 : b === 'General' ? 1 : a.localeCompare(b))),
        [activeSubcategories]
    );

    const rows = useMemo(
        () => sortedSubcategories.flatMap((subCategory) =>
            (activeSubcategories[subCategory] || []).map((skill) => ({ subCategory, skill }))
        ),
        [activeSubcategories, sortedSubcategories]
    );

    const allVisibleSkills = rows.map((r) => r.skill);

    return (
        <div className="max-w-[1920px] mx-auto flex flex-col gap-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 flex flex-wrap gap-3 items-center justify-between">
                <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Batch Editor</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">Spreadsheet mode for {activeCategory}: {rows.length} skills visible</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Apply To Visible</span>
                    <select
                        className="text-xs font-bold text-[#622F88] dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg py-2 pl-3 pr-3 focus:outline-none focus:ring-2 focus:ring-purple-300"
                        defaultValue=""
                        onChange={(e) => {
                            if (!e.target.value) return;
                            onBulkUpdate(allVisibleSkills, e.target.value as ProficiencyLevel);
                            e.target.value = '';
                        }}
                    >
                        <option value="" disabled>Set rating...</option>
                        {PROFICIENCY_LEVELS.map((level) => (
                            <option key={level} value={level}>{level}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-auto max-h-[65vh]">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 min-w-[160px]">Subcategory</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 min-w-[260px]">Skill</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 min-w-[170px]">Rating</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 min-w-[120px]">Interested</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 min-w-[130px]">Updated</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {rows.map(({ subCategory, skill }) => {
                                const details = userSkills[skill] || {};
                                const formatted = details.updatedOn ? new Date(details.updatedOn).toLocaleDateString() : '-';

                                return (
                                    <tr key={skill} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300">{subCategory}</td>
                                        <td className="px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-100">{skill}</td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={details.rating || 'N/A'}
                                                onChange={(e) => onUpdateRating(skill, e.target.value as ProficiencyLevel)}
                                                className="w-full max-w-[160px] text-xs font-bold text-slate-700 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md py-1.5 px-2.5 focus:outline-none focus:ring-2 focus:ring-purple-300"
                                            >
                                                {PROFICIENCY_LEVELS.map((level) => (
                                                    <option key={level} value={level}>{level}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => onToggleHeart(skill)}
                                                className={`inline-flex items-center justify-center h-7 px-3 rounded-md text-xs font-bold border transition-colors ${details.interested ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800/50' : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700'}`}
                                            >
                                                {details.interested ? 'Yes' : 'No'}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">{formatted}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
