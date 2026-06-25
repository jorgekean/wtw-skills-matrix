import React from 'react';
import type { ProficiencyLevel } from '../../types/skills';
import type { Colleague } from './types';

const LEVELS: ProficiencyLevel[] = ['N/A', 'Potential', 'Exposure', 'Experience', 'Expert', 'Consulting'];

export const BatchMatrixEditor: React.FC<{
    colleagues: Colleague[];
    editableSkills: string[];
    pendingChanges: number;
    isSaving: boolean;
    onUpdateCell: (profileId: string, skill: string, level: ProficiencyLevel) => void;
    onSave: () => void;
}> = ({ colleagues, editableSkills, pendingChanges, isSaving, onUpdateCell, onSave }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-3">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Batch Edit</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        Editing {colleagues.length} visible users x {editableSkills.length} skills
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onSave}
                    disabled={pendingChanges === 0 || isSaving}
                    className="px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg bg-[#622F88] text-white hover:bg-[#4C1D95] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isSaving ? 'Saving...' : `Save Changes (${pendingChanges})`}
                </button>
            </div>

            {editableSkills.length === 0 ? (
                <div className="p-8 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Select at least one target component to start batch editing.
                </div>
            ) : (
                <div className="overflow-auto max-h-[70vh]">
                    <table className="w-full min-w-245 border-collapse">
                        <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900">
                            <tr>
                                <th className="sticky left-0 z-20 bg-slate-50 dark:bg-slate-900 p-3 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border-b border-r border-slate-200 dark:border-slate-700 min-w-55">Colleague</th>
                                <th className="sticky left-55 z-20 bg-slate-50 dark:bg-slate-900 p-3 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border-b border-r border-slate-200 dark:border-slate-700 min-w-30">Role</th>
                                {editableSkills.map((skill) => (
                                    <th key={skill} className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border-b border-r border-slate-200 dark:border-slate-700 min-w-37.5">
                                        {skill}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {colleagues.map((colleague) => (
                                <tr key={colleague.profileId} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                    <td className="sticky left-0 z-10 bg-white dark:bg-slate-800 p-3 border-b border-r border-slate-100 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-slate-100">
                                        {colleague.name}
                                    </td>
                                    <td className="sticky left-55 z-10 bg-white dark:bg-slate-800 p-3 border-b border-r border-slate-100 dark:border-slate-700 text-xs font-bold text-[#622F88] dark:text-purple-300 uppercase tracking-widest">
                                        {colleague.role}
                                    </td>
                                    {editableSkills.map((skill) => {
                                        const current = colleague.matrix[skill] || 'N/A';
                                        return (
                                            <td key={`${colleague.profileId}-${skill}`} className="p-2 border-b border-r border-slate-100 dark:border-slate-700">
                                                <select
                                                    value={current}
                                                    onChange={(e) => onUpdateCell(colleague.profileId, skill, e.target.value as ProficiencyLevel)}
                                                    className="w-full text-xs font-bold rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-100 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-300"
                                                >
                                                    {LEVELS.map((lvl) => (
                                                        <option key={lvl} value={lvl}>{lvl}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
