import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// --- Import the Generated Dataverse Services ---
import { Wtw_skilllibrariesService } from '../../generated/services/Wtw_skilllibrariesService';
import { Wtw_colleagueprofilesService } from '../../generated/services/Wtw_colleagueprofilesService';
import { Wtw_skillassessmentsService } from '../../generated/services/Wtw_skillassessmentsService';
import { useTheme } from '../../hooks/useTheme';
import { INT_TO_LEVEL, type ProficiencyLevel } from '../../types/skills';
import { sortSubcategories } from '../../utils/subCategories';

// --- Types ---
type MatrixView = 'BC' | 'INTERNAL';

interface Colleague {
    name: string;
    role: string;
    matrix: Record<string, ProficiencyLevel>;
    fav: string;
    tech: string[];
    matchScore?: number;
}

// Weights for Scoring (N/A = 1, Consulting = 6)
const LEVEL_WEIGHTS: Record<ProficiencyLevel, number> = { 'N/A': 1, 'Potential': 2, 'Exposure': 3, 'Experience': 4, 'Expert': 5, 'Consulting': 6 };
const LEVEL_LABELS = ['Any', 'N/A', 'Potential', 'Exposure', 'Experience', 'Expert', 'Consulting'];

// --- TEAM CATEGORY RADAR ---
const TeamHeatMap = ({ colleagues, skillsMap }: { colleagues: Colleague[], skillsMap: Record<string, string[]> }) => {
    const sortedCategories = sortSubcategories(Object.keys(skillsMap));
    const isGranularMode = sortedCategories.length <= 2;

    const radarDimensions = useMemo(() => {
        const minimumStrongLevel = LEVEL_WEIGHTS['Experience'];

        const summarizeDimension = (label: string, skills: string[], parentCategory?: string) => {
            if (skills.length === 0) {
                return null;
            }

            let totalScore = 0;
            let totalItems = 0;
            let strongCoverageCount = 0;

            colleagues.forEach((colleague) => {
                skills.forEach((skill) => {
                    const level = colleague.matrix[skill] || 'N/A';
                    const levelWeight = LEVEL_WEIGHTS[level];
                    totalScore += levelWeight;
                    totalItems += 1;
                    if (levelWeight >= minimumStrongLevel) {
                        strongCoverageCount += 1;
                    }
                });
            });

            const avgWeight = totalItems > 0 ? totalScore / totalItems : 1;
            const normalizedPct = ((avgWeight - 1) / 5) * 100;
            const strongCoveragePct = totalItems > 0 ? (strongCoverageCount / totalItems) * 100 : 0;

            return {
                key: parentCategory ? `${parentCategory}::${label}` : label,
                label,
                parentCategory,
                skillsCount: skills.length,
                avgWeight,
                scorePct: Math.max(0, Math.min(100, normalizedPct)),
                strongCoveragePct: Math.max(0, Math.min(100, strongCoveragePct))
            };
        };

        if (isGranularMode) {
            return sortedCategories
                .flatMap((category) => {
                    const skills = skillsMap[category] || [];
                    return skills.map((skill) => summarizeDimension(skill, [skill], category));
                })
                .filter((item): item is NonNullable<typeof item> => item !== null);
        }

        return sortedCategories
            .map((category) => {
                const skills = skillsMap[category] || [];
                return summarizeDimension(category, skills);
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);
    }, [colleagues, isGranularMode, skillsMap, sortedCategories]);

    const weakestDimensions = [...radarDimensions]
        .sort((a, b) => a.scorePct - b.scorePct)
        .slice(0, 4);

    if (radarDimensions.length === 0 || colleagues.length === 0) {
        return <div className="p-8 text-center text-slate-400 font-bold bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">No data available to generate team category radar.</div>;
    }

    const plotSize = 520;
    const chartPadding = 130;
    const size = plotSize + (chartPadding * 2);
    const centerX = chartPadding + (plotSize / 2);
    const centerY = chartPadding + (plotSize / 2) - 56;
    const radius = 190;
    const rings = [20, 40, 60, 80, 100];
    const angleStep = (Math.PI * 2) / radarDimensions.length;

    const radarPoints = radarDimensions
        .map((item, index) => {
            const angle = -Math.PI / 2 + index * angleStep;
            const r = (item.scorePct / 100) * radius;
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;
            return `${x},${y}`;
        })
        .join(' ');

    return (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-5 sm:p-6">
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{isGranularMode ? 'Team Capability Detail' : 'Team Capability By Category'}</h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{isGranularMode ? 'Showing skill-level detail because only 1-2 categories are selected.' : 'Average team proficiency normalized from N/A (0%) to Consulting (100%).'}</p>

                    <p className="mt-2 text-[10px] font-semibold text-slate-600 dark:text-slate-300 text-left">
                        <span className="font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mr-2">Legend</span>
                        Avg = team proficiency from 0% (N/A) to 100% (Consulting). Strong = % of ratings at Experience, Expert, or Consulting.
                    </p>

                    <div className="mt-1 w-full flex justify-center">
                        <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[700px] h-auto" role="img" aria-label="Team category radar chart">
                            {rings.map((ring) => {
                                const ringRadius = (ring / 100) * radius;
                                return (
                                    <circle
                                        key={ring}
                                        cx={centerX}
                                        cy={centerY}
                                        r={ringRadius}
                                        fill="none"
                                        stroke="currentColor"
                                        className="text-slate-200 dark:text-slate-700"
                                        strokeDasharray={ring === 100 ? '0' : '3 3'}
                                    />
                                );
                            })}

                            {radarDimensions.map((item, index) => {
                                const angle = -Math.PI / 2 + index * angleStep;
                                const axisX = centerX + Math.cos(angle) * radius;
                                const axisY = centerY + Math.sin(angle) * radius;
                                const labelX = centerX + Math.cos(angle) * (radius + 26);
                                const labelY = centerY + Math.sin(angle) * (radius + 26);
                                const textAnchor = Math.abs(Math.cos(angle)) < 0.2 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end';
                                const shortLabel = item.label.length > 22 ? `${item.label.slice(0, 22)}...` : item.label;

                                return (
                                    <g key={item.key}>
                                        <line x1={centerX} y1={centerY} x2={axisX} y2={axisY} stroke="currentColor" className="text-slate-200 dark:text-slate-700" />
                                        <text
                                            x={labelX}
                                            y={labelY}
                                            textAnchor={textAnchor}
                                            dominantBaseline="middle"
                                            className="fill-slate-600 dark:fill-slate-300 text-[11px] font-bold"
                                        >
                                            <tspan x={labelX} dy="-0.35em">{shortLabel}</tspan>
                                            <tspan x={labelX} dy="1.15em" className="fill-slate-500 dark:fill-slate-400 text-[10px] font-semibold">{item.scorePct.toFixed(0)}%</tspan>
                                        </text>
                                    </g>
                                );
                            })}

                            <polygon
                                points={radarPoints}
                                fill="rgba(98, 47, 136, 0.24)"
                                stroke="rgb(98, 47, 136)"
                                strokeWidth="2.5"
                            />

                            {radarDimensions.map((item, index) => {
                                const angle = -Math.PI / 2 + index * angleStep;
                                const r = (item.scorePct / 100) * radius;
                                const x = centerX + Math.cos(angle) * r;
                                const y = centerY + Math.sin(angle) * r;

                                return (
                                    <circle
                                        key={`point-${item.key}`}
                                        cx={x}
                                        cy={y}
                                        r={5}
                                        fill="rgb(98, 47, 136)"
                                        stroke="white"
                                        strokeWidth="2"
                                    >
                                        <title>{`${item.label}${item.parentCategory ? ` (${item.parentCategory})` : ''}: ${item.scorePct.toFixed(1)}% avg, ${item.strongCoveragePct.toFixed(1)}% strong coverage`}</title>
                                    </circle>
                                );
                            })}
                        </svg>
                    </div>
                </div>

                <div className="w-full lg:w-80 shrink-0">
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{isGranularMode ? 'Top Skill Gaps' : 'Top Team Gaps'}</h4>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{isGranularMode ? 'Lowest average skills first.' : 'Lowest average categories first.'}</p>

                    <div className="mt-4 space-y-3">
                        {weakestDimensions.map((item, idx) => (
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
            </div>
        </div>
    );
};

// --- Sub-Components ---
const GroupedMultiSelectDropdown = ({
    groupedOptions,
    selected,
    toggleOption,
    toggleCategory
}: {
    groupedOptions: Record<string, string[]>,
    selected: string[],
    toggleOption: (opt: string) => void,
    toggleCategory: (skills: string[]) => void
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const displayValue = selected.length === 0
        ? "Select Requirements"
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

export const MatrixSearch: React.FC = () => {
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useTheme();

    const [componentsData, setComponentsData] = useState<Record<string, string[]>>({});
    const [internalData, setInternalData] = useState<Record<string, string[]>>({});
    const [colleaguesData, setColleaguesData] = useState<Colleague[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const [activeView, setActiveView] = useState<MatrixView>('BC');

    // Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
    const [minLevel, setMinLevel] = useState<number>(0);
    const [isExactMatch, setIsExactMatch] = useState<boolean>(false);
    const [selectedRole, setSelectedRole] = useState('all');

    // UI & View State
    const [team, setTeam] = useState<Colleague[]>([]);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [viewMode, setViewMode] = useState<'TABLE' | 'HEATMAP'>('TABLE'); // NEW VIEW TOGGLE

    const uniqueRoles = useMemo(() => Array.from(new Set(colleaguesData.map(c => c.role))).filter(Boolean).sort(), [colleaguesData]);
    const currentSkillMap = activeView === 'BC' ? componentsData : internalData;
    const currentSkillFlatList = useMemo(() => Object.values(currentSkillMap).flat(), [currentSkillMap]);

    useEffect(() => {
        async function loadAllData() {
            try {
                setIsLoadingData(true);

                // 1. Force Dataverse to bypass default pagination by requesting up to 5000 records
                const [skillsRes, profilesRes, assessmentsRes] = await Promise.all([
                    Wtw_skilllibrariesService.getAll({ top: 5000 }),
                    Wtw_colleagueprofilesService.getAll({ top: 5000 }),
                    Wtw_skillassessmentsService.getAll({ maxPageSize: 5000 })
                ]);

                const skills = skillsRes.data || skillsRes;
                const profiles = profilesRes.data || profilesRes;
                const assessments = assessmentsRes.data || assessmentsRes;

                const skillIdToNameMap: Record<string, string> = {};
                const bcSkillsObj: Record<string, string[]> = {};
                const internalSkillsObj: Record<string, string[]> = {};

                if (Array.isArray(skills)) {
                    skills.forEach((s: any) => {
                        const name = s.wtw_skillname || s.wtw_name;
                        const categoryStr = s['wtw_category@OData.Community.Display.V1.FormattedValue'];
                        const categoryInt = s.wtw_category;
                        const subCategory = s.wtw_subcategory || 'General';

                        const isBC = categoryStr === 'BC Components' || categoryInt === 894790000;
                        const isInternal = categoryStr === 'Internal Initiatives' || categoryInt === 894790001;

                        if (name) {
                            skillIdToNameMap[s.wtw_skilllibraryid] = name;
                            if (isBC) {
                                if (!bcSkillsObj[subCategory]) bcSkillsObj[subCategory] = [];
                                bcSkillsObj[subCategory].push(name);
                            }
                            if (isInternal) {
                                if (!internalSkillsObj[subCategory]) internalSkillsObj[subCategory] = [];
                                internalSkillsObj[subCategory].push(name);
                            }
                        }
                    });
                    Object.keys(bcSkillsObj).forEach(k => bcSkillsObj[k].sort());
                    Object.keys(internalSkillsObj).forEach(k => internalSkillsObj[k].sort());
                    setComponentsData(bcSkillsObj);
                    setInternalData(internalSkillsObj);
                }

                if (Array.isArray(profiles) && Array.isArray(assessments)) {

                    // 2. OPTIMIZATION: Pre-group assessments by Profile ID (Hash Map)
                    // This eliminates the N+1 filter issue and makes the UI load instantly
                    const assessmentsByProfile: Record<string, any[]> = {};

                    assessments.forEach((a: any) => {
                        const pid = a._wtw_colleague_value || a._wtw_colleagueprofile_value;
                        if (pid) {
                            if (!assessmentsByProfile[pid]) {
                                assessmentsByProfile[pid] = [];
                            }
                            assessmentsByProfile[pid].push(a);
                        }
                    });

                    // 3. Map colleagues using the optimized dictionary
                    const formattedColleagues: Colleague[] = profiles.map((p: any) => {
                        const profileId = p.wtw_colleagueprofileid;
                        const matrix: Record<string, ProficiencyLevel> = {};
                        let favSkill = '';

                        // Direct O(1) lookup instead of a slow array filter
                        const userAssessments = assessmentsByProfile[profileId] || [];

                        userAssessments.forEach((a: any) => {
                            const skillId = a._wtw_skill_value || a._wtw_skilllibrary_value;
                            const skillName = skillIdToNameMap[skillId];
                            const levelInt = a.wtw_proficiency;

                            if (skillName && levelInt) {
                                matrix[skillName] = INT_TO_LEVEL[levelInt] || 'N/A';
                                if (a.wtw_isfavorite) favSkill = skillName;
                            }
                        });

                        return {
                            name: p.wtw_colleaguename || p.wtw_name || 'Unknown',
                            role: p.wtw_jobrole || 'Unassigned',
                            matrix: matrix,
                            fav: favSkill,
                            tech: []
                        };
                    });

                    // OPTIMIZATION: Sort colleagues alphabetically by name
                    formattedColleagues.sort((a, b) => a.name.localeCompare(b.name));

                    setColleaguesData(formattedColleagues);
                }
            } catch (error) {
                console.error("Failed to load data:", error);
            } finally {
                setIsLoadingData(false);
            }
        }
        loadAllData();
    }, []);

    const handleViewChange = (view: MatrixView) => {
        if (view === activeView) return;
        setActiveView(view);
        setSelectedComponents([]);
        setMinLevel(0);
        setExpandedRows(new Set());
    };

    const toggleComponent = (comp: string) => setSelectedComponents(prev => prev.includes(comp) ? prev.filter(c => c !== comp) : [...prev, comp]);

    const toggleCategory = (categorySkills: string[]) => {
        const allSelected = categorySkills.every(s => selectedComponents.includes(s));
        if (allSelected) {
            setSelectedComponents(prev => prev.filter(s => !categorySkills.includes(s)));
        } else {
            setSelectedComponents(prev => Array.from(new Set([...prev, ...categorySkills])));
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedComponents([]);
        setMinLevel(0);
        setIsExactMatch(false);
        setSelectedRole('all');
        setTeam([]);
        setExpandedRows(new Set());
    };

    const toggleTeamMember = (colleague: Colleague) => {
        setTeam(prev => prev.some(m => m.name === colleague.name) ? prev.filter(m => m.name !== colleague.name) : [...prev, colleague]);
    };

    const toggleRowExpansion = (name: string) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(name)) newSet.delete(name);
            else newSet.add(name);
            return newSet;
        });
    };

    const handleEditProfile = (colleagueName: string) => navigate(`/profile/${colleagueName.toLowerCase().replace(/\s+/g, '-')}`);

    const calculateMatchScore = (colleague: Colleague) => {
        if (selectedComponents.length === 0) return 100.00;
        let totalScore = 0;
        const targetWeight = minLevel === 0 ? 2 : minLevel;

        selectedComponents.forEach(comp => {
            const userLvl = colleague.matrix[comp] || 'N/A';
            const userWeight = LEVEL_WEIGHTS[userLvl];

            if (minLevel === 0) {
                totalScore += (userWeight > 1 ? 100 : 0);
            } else {
                if (isExactMatch) {
                    totalScore += (userWeight === targetWeight ? 100 : 0);
                } else {
                    if (userWeight === 1) {
                        totalScore += 0;
                    } else if (userWeight >= targetWeight) {
                        totalScore += 100;
                    } else {
                        const score = ((userWeight - 1) / (targetWeight - 1)) * 100;
                        totalScore += score;
                    }
                }
            }
        });
        return totalScore / selectedComponents.length;
    };

    const processedColleagues = useMemo(() => {
        const scored = colleaguesData.map(c => ({
            ...c,
            matchScore: calculateMatchScore(c)
        })).filter(c => {
            if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            if (selectedRole !== 'all' && c.role !== selectedRole) return false;

            if (selectedComponents.length > 0) {
                if (c.matchScore === 0) return false;
                if (isExactMatch && c.matchScore! < 99.99) return false;
            } else if (minLevel > 0) {
                const relevantSkills = Object.entries(c.matrix).filter(([k]) => currentSkillFlatList.includes(k));
                const hasAnyMatchingSkill = relevantSkills.some(([_, lvl]) => {
                    const w = LEVEL_WEIGHTS[lvl as ProficiencyLevel];
                    return isExactMatch ? w === minLevel : w >= minLevel;
                });
                if (!hasAnyMatchingSkill) return false;
            }
            return true;
        });

        // UPDATED: Sort by Match Score first, then fall back to alphabetical by Name!
        return scored.sort((a, b) =>
            (b.matchScore || 0) - (a.matchScore || 0) ||
            a.name.localeCompare(b.name)
        );
    }, [colleaguesData, searchQuery, selectedComponents, minLevel, isExactMatch, selectedRole, currentSkillFlatList]);

    // GAP Analysis Logic
    const getTeamGapAnalysis = () => {
        const presentRoles = Array.from(new Set(team.map(m => m.role))).sort();
        const targetWeight = minLevel === 0 ? 2 : minLevel;
        const targetStr = minLevel === 0 ? 'Any Experience' : LEVEL_LABELS[minLevel];

        return currentSkillFlatList.map(skill => {
            const isTargeted = selectedComponents.includes(skill);
            const roleBreakdown = presentRoles.map(role => {
                let maxWeight = 0;
                let topLevelStr = 'Missing';
                const experts: string[] = [];

                team.filter(m => m.role === role).forEach(member => {
                    const lvl = member.matrix[skill];
                    const weight = lvl ? LEVEL_WEIGHTS[lvl] : 0;
                    if (weight > maxWeight) {
                        maxWeight = weight;
                        topLevelStr = lvl;
                    }
                    if (weight >= 5) {
                        if (!experts.includes(member.name)) experts.push(member.name);
                    }
                });
                const hasGap = isTargeted && (maxWeight < targetWeight || maxWeight === 1);
                return { role, maxWeight, topLevelStr, experts, hasGap };
            });

            const overallMaxWeight = Math.max(...roleBreakdown.map(r => r.maxWeight), 0);
            const overallGap = isTargeted && (overallMaxWeight < targetWeight || overallMaxWeight === 1);
            return { skill, roleBreakdown, isTargeted, overallGap, targetStr };
        });
    };

    const currentGapAnalysis = getTeamGapAnalysis();

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-200 font-sans">
            {/* Header */}
            <header className="bg-gradient-to-r from-[#622F88] to-[#4C1D95] shadow-lg flex-shrink-0 z-50">
                <div className="max-w-[1920px] mx-auto px-6 py-4 flex justify-between items-center text-white">
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-1.5 bg-white opacity-40 rounded-full"></div>
                        <h1 className="font-black uppercase tracking-tighter text-lg">
                            Resource Intelligence <span className="font-light opacity-60 text-sm hidden sm:inline">| Smart Matrix</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-white/50 group-focus-within:text-white transition-colors" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                            </div>
                            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Quick Search Name..." className="bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl pl-9 pr-4 py-2 text-sm w-48 sm:w-64 outline-none focus:bg-white focus:text-slate-900 focus:ring-2 focus:ring-purple-300 transition-all placeholder:text-white/60" />
                        </div>
                        <button onClick={toggleTheme} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 p-2 rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center">
                            {isDark ? <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> : <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
                        </button>
                    </div>
                </div>
            </header>

            {/* Smart Project Requirements Section */}
            <section className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 z-40 relative">
                <div className="absolute top-0 left-0 w-1 bg-[#622F88] h-full"></div>
                <div className="max-w-[1920px] mx-auto px-6 py-4 flex flex-col gap-5">
                    <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-700/50 pb-4">
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active Matrix View</span>
                        <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl inline-flex shadow-inner">
                            <button onClick={() => handleViewChange('BC')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeView === 'BC' ? 'bg-white dark:bg-slate-700 text-[#622F88] dark:text-purple-300 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>BC Components</button>
                            <button onClick={() => handleViewChange('INTERNAL')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeView === 'INTERNAL' ? 'bg-white dark:bg-slate-700 text-[#622F88] dark:text-purple-300 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>Internal Initiatives</button>
                        </div>
                    </div>

                    <div className="flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-end">
                        <div className="flex flex-wrap gap-8 items-end flex-1 pl-2">
                            <div className="flex flex-col w-full xl:w-auto">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2 tracking-widest flex items-center gap-2">
                                    Target {activeView === 'BC' ? 'Components' : 'Initiatives'}
                                    {isLoadingData && <span className="animate-pulse text-purple-400">(Loading Dataverse...)</span>}
                                </label>
                                <GroupedMultiSelectDropdown groupedOptions={currentSkillMap} selected={selectedComponents} toggleOption={toggleComponent} toggleCategory={toggleCategory} />
                            </div>
                            <div className="flex flex-col w-full sm:w-72">
                                <div className="flex justify-between items-end mb-2">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Level</label>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[9px] font-bold transition-colors ${!isExactMatch ? 'text-[#622F88] dark:text-purple-400' : 'text-slate-400'}`}>Smart Match</span>
                                        <button onClick={() => setIsExactMatch(!isExactMatch)} className={`w-8 h-4 rounded-full transition-colors relative ${isExactMatch ? 'bg-[#622F88]' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                            <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${isExactMatch ? 'translate-x-4' : 'translate-x-1'}`}></div>
                                        </button>
                                        <span className={`text-[9px] font-bold transition-colors ${isExactMatch ? 'text-[#622F88] dark:text-purple-400' : 'text-slate-400'}`}>Exact</span>
                                    </div>
                                </div>
                                <div className="relative pt-1">
                                    <input type="range" min="0" max="6" step="1" value={minLevel} onChange={(e) => setMinLevel(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#622F88]" />
                                    <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-2 px-1">
                                        {LEVEL_LABELS.map((lbl, idx) => (
                                            <span key={lbl} className={minLevel === idx || (!isExactMatch && minLevel > 0 && idx >= minLevel) ? 'text-[#622F88] dark:text-purple-400' : ''}>{lbl}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-end gap-4 w-full xl:w-auto">
                            <div className="flex flex-col flex-1 sm:flex-none">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2 tracking-widest">Role Filter</label>
                                <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-[11px] font-bold text-[#622F88] dark:text-purple-300 outline-none w-full sm:w-36 appearance-none shadow-sm">
                                    <option value="all" className="text-slate-700 dark:text-slate-200">Any Role</option>
                                    {uniqueRoles.map(role => <option key={role} value={role}>{role}</option>)}
                                </select>
                            </div>

                            <button type="button" onClick={clearFilters} className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl transition-all active:scale-95 shadow-sm h-[38px] w-full sm:w-auto">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                Clear
                            </button>

                            {/* VIEW TOGGLE BUTTONS */}
                            <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1 shadow-inner h-[38px]">
                                <button type="button" onClick={() => setViewMode('TABLE')} className={`flex items-center justify-center px-3 text-xs font-bold rounded-lg transition-all ${viewMode === 'TABLE' ? 'bg-white dark:bg-slate-800 text-[#622F88] dark:text-purple-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                                    <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                                    List
                                </button>
                                <button type="button" onClick={() => setViewMode('HEATMAP')} className={`flex items-center justify-center px-3 text-xs font-bold rounded-lg transition-all ${viewMode === 'HEATMAP' ? 'bg-white dark:bg-slate-800 text-[#622F88] dark:text-purple-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                                    <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                    Grid
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content Area */}
            <main className="flex-1 flex overflow-hidden max-w-[1920px] mx-auto w-full relative z-10">
                <div className={`flex-1 overflow-y-auto p-6 transition-all duration-300 ${team.length > 0 ? 'pr-[340px] xl:pr-6' : ''}`}>

                    {isLoadingData && (
                        <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-2xl m-6">
                            <div className="w-10 h-10 border-4 border-purple-200 border-t-[#622F88] rounded-full animate-spin mb-4"></div>
                            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Fetching Dataverse Matrix...</p>
                        </div>
                    )}

                    {viewMode === 'HEATMAP' ? (
                        // HEAT MAP VIEW
                        <TeamHeatMap
                            colleagues={processedColleagues}
                            skillsMap={
                                // If no specific skills are searched, show all grouped by subcategory
                                selectedComponents.length === 0
                                    ? currentSkillMap
                                    // If filtered, build a temporary map containing only selected skills
                                    : Object.fromEntries(
                                        Object.entries(currentSkillMap)
                                            .map(([cat, skills]) => [cat, skills.filter(s => selectedComponents.includes(s))])
                                            .filter(([_, skills]) => skills.length > 0)
                                    )
                            }
                        />
                    ) : (
                        // TABLE VIEW
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden min-h-[50vh] relative">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/90 dark:bg-slate-900/90 sticky top-0 z-10 backdrop-blur-md">
                                    <tr>
                                        <th className="w-10 p-5 border-b-2 border-slate-100 dark:border-slate-700/50"></th>
                                        {selectedComponents.length > 0 && !isExactMatch && (
                                            <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100 dark:border-slate-700/50 w-24">Match</th>
                                        )}
                                        <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100 dark:border-slate-700/50">Colleague</th>
                                        <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100 dark:border-slate-700/50">
                                            {activeView === 'BC' ? 'BC Components' : 'Internal Initiatives'}
                                        </th>
                                        <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100 dark:border-slate-700/50 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                    {!isLoadingData && processedColleagues.length === 0 ? (
                                        <tr><td colSpan={6} className="p-8 text-center text-slate-400 text-sm font-semibold">No colleagues found matching your criteria.</td></tr>
                                    ) : processedColleagues.map((c) => {
                                        const isSelected = team.some(m => m.name === c.name);
                                        const isExpanded = expandedRows.has(c.name);

                                        const userSkillsInView = Object.entries(c.matrix)
                                            .filter(([k]) => currentSkillFlatList.includes(k))
                                            .sort((a, b) => {
                                                const aTarget = selectedComponents.includes(a[0]) ? 1 : 0;
                                                const bTarget = selectedComponents.includes(b[0]) ? 1 : 0;
                                                if (aTarget !== bTarget) return bTarget - aTarget;
                                                const weightDiff = LEVEL_WEIGHTS[b[1] as ProficiencyLevel] - LEVEL_WEIGHTS[a[1] as ProficiencyLevel];
                                                if (weightDiff !== 0) return weightDiff;
                                                return a[0].localeCompare(b[0]);
                                            });

                                        const summarySkills = userSkillsInView.slice(0, 10);
                                        const hiddenCount = userSkillsInView.length - summarySkills.length;
                                        const totalColumns = (selectedComponents.length > 0 && !isExactMatch) ? 5 : 4;

                                        return (
                                            <React.Fragment key={c.name}>
                                                <tr className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${isSelected ? 'bg-purple-50/50 dark:bg-purple-900/10' : ''}`}>
                                                    <td className="p-3 align-middle text-center">
                                                        <button onClick={() => toggleRowExpansion(c.name)} className="p-1.5 rounded-lg text-slate-400 hover:text-[#622F88] hover:bg-purple-50 dark:hover:text-purple-300 dark:hover:bg-purple-900/20 transition-all">
                                                            <svg className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[#622F88] dark:text-purple-400' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </button>
                                                    </td>

                                                    {selectedComponents.length > 0 && !isExactMatch && (
                                                        <td className="p-5 align-middle">
                                                            <div className="flex flex-col gap-1.5 w-16">
                                                                <span className={`text-xs font-black ${c.matchScore! >= 99.99 ? 'text-emerald-500' : c.matchScore! >= 50 ? 'text-amber-500' : 'text-red-400'}`}>
                                                                    {c.matchScore!.toFixed(2)}%
                                                                </span>
                                                                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                                    <div className={`h-full ${c.matchScore! >= 99.99 ? 'bg-emerald-500' : c.matchScore! >= 50 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${c.matchScore}%` }}></div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    )}

                                                    <td className="p-5 align-middle">
                                                        <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{c.name}</div>
                                                        <div className="text-[10px] text-[#622F88] dark:text-purple-400 font-black uppercase mt-0.5 tracking-widest">{c.role}</div>
                                                    </td>

                                                    <td className="p-5 align-middle">
                                                        <div className="flex flex-wrap gap-1.5 items-center">
                                                            {summarySkills.length === 0 && <span className="text-[10px] font-semibold text-slate-400 italic">No skills recorded.</span>}
                                                            {summarySkills.map(([k, v]) => {
                                                                const isTargeted = selectedComponents.includes(k);
                                                                let activeClasses = isTargeted
                                                                    ? 'bg-[#622F88] text-white shadow-md ring-1 ring-purple-300 dark:ring-purple-700'
                                                                    : v === 'N/A'
                                                                        ? 'bg-slate-100 text-slate-400 border border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700 opacity-60'
                                                                        : 'bg-[#EEF2FF] text-[#4338CA] border border-[#C7D2FE] dark:bg-[#4338CA]/20 dark:text-[#818CF8] dark:border-[#6366f1]/30 opacity-80';

                                                                return <span key={k} className={`text-[9px] font-bold px-2 py-1 rounded transition-all ${activeClasses}`}>{k} ({v})</span>
                                                            })}
                                                            {hiddenCount > 0 && (
                                                                <button onClick={() => toggleRowExpansion(c.name)} className="text-[9px] font-black text-slate-500 hover:text-[#622F88] dark:text-slate-400 dark:hover:text-purple-300 px-2 py-1 bg-slate-100 hover:bg-purple-50 dark:bg-slate-800 dark:hover:bg-slate-700 rounded transition-colors">
                                                                    +{hiddenCount} more
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td className="p-5 align-middle">
                                                        <div className="flex justify-end items-center gap-2">
                                                            <button onClick={() => handleEditProfile(c.name)} className="p-1.5 rounded-lg text-slate-400 hover:text-[#622F88] hover:bg-purple-50 dark:hover:text-purple-300 dark:hover:bg-purple-900/20 transition-colors" title={`Edit ${c.name}'s Profile`}>
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                            </button>
                                                            <button onClick={() => toggleTeamMember(c)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${isSelected ? 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300' : 'bg-[#622F88] text-white hover:bg-[#4C1D95] shadow-sm'}`}>
                                                                {isSelected ? <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg> Remove</> : <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg> Shortlist</>}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {isExpanded && (
                                                    <tr className="bg-slate-50/80 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-700 shadow-inner">
                                                        <td colSpan={totalColumns + 1} className="p-0">
                                                            <div className="px-6 py-6 sm:px-16 lg:px-24 w-full">
                                                                <h4 className="text-[10px] font-black text-[#622F88] dark:text-purple-400 uppercase tracking-widest mb-4 border-b border-purple-100 dark:border-purple-900/30 pb-2">Full Matrix Profile</h4>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-x-8 gap-y-6">
                                                                    {Object.entries(currentSkillMap).map(([subCat, categorySkills]) => {
                                                                        const userSkillsInCategory = Object.entries(c.matrix).filter(([k]) => categorySkills.includes(k)).sort((a, b) => {
                                                                            const aTarget = selectedComponents.includes(a[0]) ? 1 : 0;
                                                                            const bTarget = selectedComponents.includes(b[0]) ? 1 : 0;
                                                                            return bTarget - aTarget;
                                                                        });

                                                                        if (userSkillsInCategory.length === 0) return null;

                                                                        return (
                                                                            <div key={subCat} className="flex flex-col gap-2">
                                                                                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{subCat}</span>
                                                                                <div className="flex flex-wrap gap-1.5 items-center">
                                                                                    {userSkillsInCategory.map(([k, v]) => {
                                                                                        const isTargeted = selectedComponents.includes(k);
                                                                                        let activeClasses = isTargeted ? 'bg-[#622F88] text-white shadow-md' : v === 'N/A' ? 'bg-white text-slate-400 border border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700 opacity-60' : 'bg-white text-[#4338CA] border border-[#C7D2FE] dark:bg-slate-800 dark:text-[#818CF8] dark:border-[#6366f1]/30';
                                                                                        return <span key={k} className={`text-[9px] font-bold px-2.5 py-1 rounded-md transition-all ${activeClasses}`}>{k} ({v})</span>
                                                                                    })}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Team Builder Sidebar */}
                {team.length > 0 && (
                    <div className="absolute right-0 top-0 bottom-0 w-[320px] xl:relative xl:w-80 bg-slate-50 dark:bg-slate-800/80 border-l border-slate-200 dark:border-slate-700 p-6 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)] overflow-y-auto z-20 transition-transform flex flex-col">
                        <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-50 dark:bg-slate-800 z-10 pb-2 shrink-0">
                            <div>
                                <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">Team Builder</h2>
                                <p className="text-xs text-slate-500 mt-1">{team.length} {team.length === 1 ? 'Member' : 'Members'} Selected</p>
                            </div>
                            <button onClick={() => setTeam([])} className="text-[10px] font-bold text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded">Clear</button>
                        </div>
                        <div className="flex flex-col gap-3 overflow-y-auto flex-1 pb-6">
                            {team.map(member => (
                                <div key={member.name} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative group shrink-0">
                                    <button onClick={() => toggleTeamMember(member)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100" title="Remove">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                    <div className="font-bold text-sm text-slate-800 dark:text-slate-100">{member.name}</div>
                                    <div className="text-[10px] font-black text-[#622F88] dark:text-purple-400 tracking-widest uppercase mb-2">{member.role}</div>
                                </div>
                            ))}
                        </div>
                        <div className="shrink-0 pt-4 bg-slate-50 dark:bg-slate-800 sticky bottom-0">
                            <button onClick={() => setShowAnalysis(true)} className="w-full py-3.5 rounded-xl bg-[#622F88] hover:bg-[#4C1D95] text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                Analyze Gap Coverage
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* TEAM GAP ANALYSIS MODAL */}
            {showAnalysis && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 opacity-100 transition-opacity">
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700 transform transition-all scale-100">
                        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 shrink-0">
                            <div>
                                <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">Gap Analysis & Coverage Matrix</h2>
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">
                                    Evaluating {team.length} Team Members ({activeView === 'BC' ? 'BC Components' : 'Internal Initiatives'})
                                </p>
                            </div>
                            <button onClick={() => setShowAnalysis(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors">
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
                                                    Req: {minLevel === 0 ? 'Any' : LEVEL_LABELS[minLevel]}
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
                                                                                    return <div key={segment} className={`flex-1 rounded-sm transition-colors duration-500 ${color}`}></div>
                                                                                })}
                                                                            </div>
                                                                            <span className={`w-14 text-right text-[10px] font-black ${rc.maxWeight >= 4 ? 'text-emerald-500' : rc.maxWeight === 0 || rc.maxWeight === 1 ? 'text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                                                                {rc.topLevelStr === 'Missing' ? 'N/A' : rc.topLevelStr}
                                                                            </span>
                                                                        </div>
                                                                        <div className="min-h-[16px]">
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
            )}
        </div>
    );
};