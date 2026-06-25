import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// --- Import the Generated Dataverse Services ---
import { Wtw_skilllibrariesService } from '../../generated/services/Wtw_skilllibrariesService';
import { Wtw_colleagueprofilesService } from '../../generated/services/Wtw_colleagueprofilesService';
import { Wtw_skillassessmentsService } from '../../generated/services/Wtw_skillassessmentsService';
import { useTheme } from '../../hooks/useTheme';
import { INT_TO_LEVEL, type ProficiencyLevel } from '../../types/skills';
import { TeamHeatMap } from '../heatmap/TeamHeatMap';
import { MatrixRequirementsSection } from './MatrixRequirementsSection';
import { MatrixLoadingOverlay } from './MatrixLoadingOverlay';
import { TeamBuilderSidebar } from './TeamBuilderSidebar';
import { GapAnalysisModal } from './GapAnalysisModal';
import { BatchMatrixEditor } from './BatchMatrixEditor';
import type { MatrixView, Colleague, TeamGapAnalysisItem } from './types';

// Weights for Scoring (N/A = 1, Consulting = 6)
const LEVEL_WEIGHTS: Record<ProficiencyLevel, number> = { 'N/A': 1, 'Potential': 2, 'Exposure': 3, 'Experience': 4, 'Expert': 5, 'Consulting': 6 };
const LEVEL_LABELS = ['Any', 'N/A', 'Potential', 'Exposure', 'Experience', 'Expert', 'Consulting'];
const LEVEL_TO_INT: Record<ProficiencyLevel, number> = {
    'N/A': 894790000,
    'Potential': 894790001,
    'Exposure': 894790002,
    'Experience': 894790003,
    'Expert': 894790004,
    'Consulting': 894790005
};

type OrderedSkill = {
    name: string;
    sortOrder?: number;
};

const compareOrderedSkills = (a: OrderedSkill, b: OrderedSkill) => {
    const aHasOrder = typeof a.sortOrder === 'number';
    const bHasOrder = typeof b.sortOrder === 'number';

    if (aHasOrder && bHasOrder && a.sortOrder !== b.sortOrder) {
        return (a.sortOrder as number) - (b.sortOrder as number);
    }

    if (aHasOrder && !bHasOrder) return -1;
    if (!aHasOrder && bHasOrder) return 1;

    return a.name.localeCompare(b.name);
};

const normalizeSortOrder = (value: unknown): number | undefined => {
    if (value === null || value === undefined || value === '') return undefined;
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : undefined;
};

const compareSubcategoriesByFirstSkillOrder = (
    a: [string, OrderedSkill[]],
    b: [string, OrderedSkill[]]
) => {
    const aFirst = a[1][0]?.sortOrder;
    const bFirst = b[1][0]?.sortOrder;
    const aHasOrder = typeof aFirst === 'number';
    const bHasOrder = typeof bFirst === 'number';

    if (aHasOrder && bHasOrder && aFirst !== bFirst) {
        return (aFirst as number) - (bFirst as number);
    }

    if (aHasOrder && !bHasOrder) return -1;
    if (!aHasOrder && bHasOrder) return 1;

    if (a[0] === 'General' && b[0] !== 'General') return -1;
    if (a[0] !== 'General' && b[0] === 'General') return 1;

    return a[0].localeCompare(b[0]);
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
    const [isBatchEditMode, setIsBatchEditMode] = useState(false);
    const [isSavingBatchChanges, setIsSavingBatchChanges] = useState(false);

    const [pendingBatchChanges, setPendingBatchChanges] = useState<Record<string, ProficiencyLevel>>({});

    const [skillNameToIdMap, setSkillNameToIdMap] = useState<Record<string, string>>({});

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
                const skillNameToIdMapLocal: Record<string, string> = {};
                const bcSkillsObj: Record<string, OrderedSkill[]> = {};
                const internalSkillsObj: Record<string, OrderedSkill[]> = {};

                if (Array.isArray(skills)) {
                    skills.forEach((s: any) => {
                        const name = s.wtw_skillname || s.wtw_name;
                        const categoryStr = s['wtw_category@OData.Community.Display.V1.FormattedValue'];
                        const categoryInt = s.wtw_category;
                        const subCategory = s.wtw_subcategory || 'General';
                        const sortOrder = normalizeSortOrder(s.wtw_sortorder);

                        const isBC = categoryStr === 'BC Components' || categoryInt === 894790000;
                        const isInternal = categoryStr === 'Internal Initiatives' || categoryInt === 894790001;

                        if (name) {
                            skillIdToNameMap[s.wtw_skilllibraryid] = name;
                            skillNameToIdMapLocal[name] = s.wtw_skilllibraryid;
                            if (isBC) {
                                if (!bcSkillsObj[subCategory]) bcSkillsObj[subCategory] = [];
                                bcSkillsObj[subCategory].push({ name, sortOrder });
                            }
                            if (isInternal) {
                                if (!internalSkillsObj[subCategory]) internalSkillsObj[subCategory] = [];
                                internalSkillsObj[subCategory].push({ name, sortOrder });
                            }
                        }
                    });
                    setSkillNameToIdMap(skillNameToIdMapLocal);
                    Object.keys(bcSkillsObj).forEach(k => bcSkillsObj[k].sort(compareOrderedSkills));
                    Object.keys(internalSkillsObj).forEach(k => internalSkillsObj[k].sort(compareOrderedSkills));

                    const bcSkillsForUi: Record<string, string[]> = {};
                    Object.entries(bcSkillsObj)
                        .sort(compareSubcategoriesByFirstSkillOrder)
                        .forEach(([subCategory, orderedSkills]) => {
                            bcSkillsForUi[subCategory] = orderedSkills.map(skill => skill.name);
                    });

                    const internalSkillsForUi: Record<string, string[]> = {};
                    Object.entries(internalSkillsObj)
                        .sort(compareSubcategoriesByFirstSkillOrder)
                        .forEach(([subCategory, orderedSkills]) => {
                            internalSkillsForUi[subCategory] = orderedSkills.map(skill => skill.name);
                    });

                    setComponentsData(bcSkillsForUi);
                    setInternalData(internalSkillsForUi);
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
                        const assessmentIds: Record<string, string> = {};
                        let favSkill = '';

                        // Direct O(1) lookup instead of a slow array filter
                        const userAssessments = assessmentsByProfile[profileId] || [];

                        userAssessments.forEach((a: any) => {
                            const skillId = a._wtw_skill_value || a._wtw_skilllibrary_value;
                            const skillName = skillIdToNameMap[skillId];
                            const levelInt = a.wtw_proficiency;

                            if (skillName && levelInt) {
                                matrix[skillName] = INT_TO_LEVEL[levelInt] || 'N/A';
                                assessmentIds[skillName] = a.wtw_skillassessmentid;
                                if (a.wtw_isfavorite) favSkill = skillName;
                            }
                        });

                        return {
                            profileId,
                            name: p.wtw_colleaguename || p.wtw_name || 'Unknown',
                            role: p.wtw_jobrole || 'Unassigned',
                            matrix: matrix,
                            assessmentIds,
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
        setPendingBatchChanges({});
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
        setPendingBatchChanges({});
    };

    const handleBatchCellUpdate = (profileId: string, skill: string, level: ProficiencyLevel) => {
        setColleaguesData(prev => prev.map(c => {
            if (c.profileId !== profileId) return c;
            return {
                ...c,
                matrix: {
                    ...c.matrix,
                    [skill]: level
                }
            };
        }));

        setPendingBatchChanges(prev => ({
            ...prev,
            [`${profileId}::${skill}`]: level
        }));
    };

    const saveBatchChanges = async () => {
        const entries = Object.entries(pendingBatchChanges);
        if (entries.length === 0) return;

        try {
            setIsSavingBatchChanges(true);
            const successfulKeys = new Set<string>();
            const failedKeys: string[] = [];

            for (const [key, level] of entries) {
                const [profileId, skillName] = key.split('::');
                const colleague = colleaguesData.find(c => c.profileId === profileId);
                const skillId = skillNameToIdMap[skillName];

                if (!colleague || !skillId) continue;

                const existingAssessmentId = colleague.assessmentIds[skillName];
                const proficiencyInt = LEVEL_TO_INT[level];

                try {
                    if (existingAssessmentId) {
                        await Wtw_skillassessmentsService.update(existingAssessmentId, {
                            wtw_proficiency: proficiencyInt
                        } as any);

                        const verify = await Wtw_skillassessmentsService.get(existingAssessmentId);
                        const savedProficiency = (verify.data || verify as any)?.wtw_proficiency;
                        if (savedProficiency !== proficiencyInt) {
                            throw new Error(`Verification failed for ${colleague.name} - ${skillName}`);
                        }
                    } else {
                        const created = await Wtw_skillassessmentsService.create({
                            wtw_skillassessment1: `${colleague.name} - ${skillName}`,
                            wtw_proficiency: proficiencyInt,
                            wtw_isfavorite: false,
                            "wtw_Colleague@odata.bind": `/wtw_colleagueprofiles(${profileId})`,
                            "wtw_Skill@odata.bind": `/wtw_skilllibraries(${skillId})`
                        } as any);

                        const newId = created?.data?.wtw_skillassessmentid || (created as any)?.wtw_skillassessmentid;
                        if (!newId) {
                            throw new Error(`Create response missing assessment id for ${colleague.name} - ${skillName}`);
                        }

                        const verify = await Wtw_skillassessmentsService.get(newId);
                        const savedProficiency = (verify.data || verify as any)?.wtw_proficiency;
                        if (savedProficiency !== proficiencyInt) {
                            throw new Error(`Verification failed for ${colleague.name} - ${skillName}`);
                        }

                        setColleaguesData(prev => prev.map(c => {
                            if (c.profileId !== profileId) return c;
                            return {
                                ...c,
                                assessmentIds: {
                                    ...c.assessmentIds,
                                    [skillName]: newId
                                }
                            };
                        }));
                    }

                    successfulKeys.add(key);
                } catch (entryError) {
                    console.error('Batch save entry failed:', key, entryError);
                    failedKeys.push(key);
                }
            }

            setPendingBatchChanges(prev => {
                const next = { ...prev };
                successfulKeys.forEach(k => {
                    delete next[k];
                });
                return next;
            });

            if (failedKeys.length > 0) {
                alert(`Saved ${successfulKeys.size} change(s), but ${failedKeys.length} failed verification in Dataverse.`);
            }
        } catch (error) {
            console.error('Failed to save batch changes:', error);
            alert('Failed to save one or more batch changes. Please check console details.');
        } finally {
            setIsSavingBatchChanges(false);
        }
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
    const getTeamGapAnalysis = (): TeamGapAnalysisItem[] => {
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
    const editableSkills = useMemo(() => {
        const orderedAllSkills = Array.from(new Set(currentSkillFlatList));

        if (selectedComponents.length === 0) {
            return orderedAllSkills;
        }

        const selectedSet = new Set(selectedComponents);
        return orderedAllSkills.filter(skill => selectedSet.has(skill));
    }, [selectedComponents, currentSkillFlatList]);

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
                        <button
                            type="button"
                            onClick={() => setIsBatchEditMode(prev => !prev)}
                            className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${isBatchEditMode ? 'bg-white text-[#622F88] border-white' : 'bg-white/10 hover:bg-white/20 text-white border-white/20'}`}
                        >
                            {isBatchEditMode ? 'Standard View' : 'Batch Edit'}
                        </button>
                    </div>
                </div>
            </header>

            <MatrixRequirementsSection
                activeView={activeView}
                isLoadingData={isLoadingData}
                currentSkillMap={currentSkillMap}
                selectedComponents={selectedComponents}
                minLevel={minLevel}
                isExactMatch={isExactMatch}
                selectedRole={selectedRole}
                uniqueRoles={uniqueRoles}
                viewMode={viewMode}
                levelLabels={LEVEL_LABELS}
                onViewChange={handleViewChange}
                onToggleComponent={toggleComponent}
                onToggleCategory={toggleCategory}
                onMinLevelChange={setMinLevel}
                onExactMatchToggle={() => setIsExactMatch(!isExactMatch)}
                onRoleChange={setSelectedRole}
                onClearFilters={clearFilters}
                onViewModeChange={setViewMode}
            />

            {/* Main Content Area */}
            <main className="flex-1 flex overflow-hidden max-w-[1920px] mx-auto w-full relative z-10">
                <div className={`flex-1 overflow-y-auto p-6 transition-all duration-300 ${team.length > 0 ? 'pr-[340px] xl:pr-6' : ''}`}>

                    {isLoadingData && <MatrixLoadingOverlay />}

                    {isBatchEditMode ? (
                        <BatchMatrixEditor
                            colleagues={processedColleagues}
                            editableSkills={editableSkills}
                            pendingChanges={Object.keys(pendingBatchChanges).length}
                            isSaving={isSavingBatchChanges}
                            onUpdateCell={handleBatchCellUpdate}
                            onSave={saveBatchChanges}
                        />
                    ) : viewMode === 'HEATMAP' ? (
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

                {!isBatchEditMode && (
                    <TeamBuilderSidebar
                        team={team}
                        onToggleTeamMember={toggleTeamMember}
                        onClearTeam={() => setTeam([])}
                        onAnalyze={() => setShowAnalysis(true)}
                    />
                )}
            </main>

            <GapAnalysisModal
                show={showAnalysis}
                team={team}
                activeView={activeView}
                selectedComponents={selectedComponents}
                minLevel={minLevel}
                levelLabels={LEVEL_LABELS}
                currentSkillMap={currentSkillMap}
                currentGapAnalysis={currentGapAnalysis}
                onClose={() => setShowAnalysis(false)}
            />
        </div>
    );
};