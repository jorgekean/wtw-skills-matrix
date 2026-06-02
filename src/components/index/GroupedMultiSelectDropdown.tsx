import { useState } from 'react';

export const GroupedMultiSelectDropdown = ({
    groupedOptions,
    selected,
    toggleOption,
    toggleCategory
}: {
    groupedOptions: Record<string, string[]>;
    selected: string[];
    toggleOption: (opt: string) => void;
    toggleCategory: (skills: string[]) => void;
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const displayValue = selected.length === 0
        ? 'Select Requirements'
        : selected.length === 1
            ? selected[0]
            : `${selected.length} Selected`;

    return (
        <div className="relative w-full xl:w-64">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 flex justify-between items-center shadow-sm hover:border-[#622F88] transition-colors"
            >
                <span className="truncate">{displayValue}</span>
                <svg className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 max-h-80 overflow-y-auto overflow-x-hidden flex flex-col">
                        {Object.entries(groupedOptions).map(([category, items]) => {
                            if (items.length === 0) return null;
                            const isAllSelected = items.every(i => selected.includes(i));
                            const isSomeSelected = items.some(i => selected.includes(i)) && !isAllSelected;

                            return (
                                <div key={category} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 pb-1">
                                    <div
                                        className="sticky top-0 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors z-10"
                                        onClick={() => toggleCategory(items)}
                                    >
                                        <span className="text-[10px] font-black text-[#622F88] dark:text-purple-400 uppercase tracking-widest">{category}</span>
                                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${isAllSelected ? 'bg-[#622F88] border-[#622F88]' : isSomeSelected ? 'bg-purple-200 border-purple-300 dark:bg-purple-900 dark:border-purple-700' : 'bg-white border-slate-300 dark:bg-slate-800 dark:border-slate-600'}`}>
                                            {isAllSelected && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                            {isSomeSelected && <div className="w-1.5 h-1.5 bg-[#622F88] dark:bg-purple-400 rounded-sm"></div>}
                                        </div>
                                    </div>
                                    <div className="flex flex-col py-1">
                                        {items.map(opt => (
                                            <label key={opt} className="flex items-center px-4 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer ml-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selected.includes(opt)}
                                                    onChange={() => toggleOption(opt)}
                                                    className="rounded border-slate-300 text-[#622F88] focus:ring-[#622F88] w-3.5 h-3.5 mr-3"
                                                />
                                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};
