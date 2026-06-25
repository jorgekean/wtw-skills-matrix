import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { type ProficiencyLevel } from '../../types/skills';
import { SkillCard } from './SkillCard';

// --- Import the Generated Dataverse Services ---
import { Wtw_skilllibrariesService } from '../../generated/services/Wtw_skilllibrariesService';
import { Wtw_colleagueprofilesService } from '../../generated/services/Wtw_colleagueprofilesService';
import { Wtw_skillassessmentsService } from '../../generated/services/Wtw_skillassessmentsService';
import { useTheme } from '../../hooks/useTheme';

const INT_TO_LEVEL: Record<number, ProficiencyLevel> = {
    894790000: 'N/A',
    894790001: 'Potential',
    894790002: 'Exposure',
    894790003: 'Experience',
    894790004: 'Expert',
    894790005: 'Consulting'
};

const LEVEL_TO_INT: Record<ProficiencyLevel, number> = {
    'N/A': 894790000,
    'Potential': 894790001,
    'Exposure': 894790002,
    'Experience': 894790003,
    'Expert': 894790004,
    'Consulting': 894790005
};

const DEFAULT_SKILL_STATE = { rating: null, interested: false, updatedOn: null };

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

export const SkillsMatrix: React.FC = () => {
    const navigate = useNavigate();
    const { slug } = useParams<{ slug: string }>();

    const [activeCategory, setActiveCategory] = useState<string>('');
    const { isDark, toggleTheme } = useTheme();
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // UPDATED: Dynamic Data State now maps Category -> Subcategory -> Array of Skills
    const [skillsData, setSkillsData] = useState<Record<string, Record<string, string[]>>>({});
    const [categories, setCategories] = useState<string[]>([]);

    const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
    const skillMap = useRef<Record<string, string>>({});
    const assessmentMap = useRef<Record<string, string>>({});

    const [historyNotes, setHistoryNotes] = useState<string>('');
    const [userSkills, setUserSkills] = useState<Record<string, any>>({});

    useEffect(() => {
        async function loadDataverseData() {
            try {
                setIsLoading(true);

                const [skillsRes, profilesRes] = await Promise.all([
                    Wtw_skilllibrariesService.getAll(),
                    Wtw_colleagueprofilesService.getAll(),
                    // Wtw_skillassessmentsService.getAll()
                ]);

                const skills = skillsRes.data || skillsRes;
                const profiles = profilesRes.data || profilesRes;
                // const assessments = assessmentsRes.data || assessmentsRes;
                // console.log("Fetched Skills:", skills, assessments);

                // 1. Structure the Skill Library & Build the GUID Map (UPDATED FOR SUBCATEGORIES)
                const groupedData: Record<string, Record<string, OrderedSkill[]>> = {};
                const uniqueCategories = new Set<string>();

                if (Array.isArray(skills)) {
                    skills.forEach((item: any) => {
                        const categoryName = item['wtw_category@OData.Community.Display.V1.FormattedValue'] || 'Uncategorized';
                        const subCategoryName = item.wtw_subcategory || 'General'; // Grabs subcategory or defaults
                        const skillName = item.wtw_skillname || item.wtw_name || 'Unknown Skill';
                        const skillId = item.wtw_skilllibraryid;
                        const sortOrder = normalizeSortOrder(item.wtw_sortorder);

                        if (skillName && skillId) {
                            skillMap.current[skillName] = skillId;

                            // Initialize nested dictionary levels if they don't exist
                            if (!groupedData[categoryName]) groupedData[categoryName] = {};
                            if (!groupedData[categoryName][subCategoryName]) groupedData[categoryName][subCategoryName] = [];

                            groupedData[categoryName][subCategoryName].push({
                                name: skillName,
                                sortOrder
                            });
                            uniqueCategories.add(categoryName);
                        }
                    });

                    // Sort skills by custom order first, then by name.
                    Object.keys(groupedData).forEach(cat => {
                        Object.keys(groupedData[cat]).forEach(subCat => {
                            groupedData[cat][subCat].sort(compareOrderedSkills);
                        });
                    });
                }

                const desiredOrder = ["BC Components", "Internal Initiatives", "Tech Skills", "Soft Skills"];
                const categoriesArray = Array.from(uniqueCategories).sort((a, b) => {
                    const indexA = desiredOrder.indexOf(a);
                    const indexB = desiredOrder.indexOf(b);
                    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
                });

                const groupedDataForUi: Record<string, Record<string, string[]>> = {};
                Object.keys(groupedData).forEach(cat => {
                    groupedDataForUi[cat] = {};
                    Object.entries(groupedData[cat])
                        .sort(compareSubcategoriesByFirstSkillOrder)
                        .forEach(([subCat, orderedSkills]) => {
                            groupedDataForUi[cat][subCat] = orderedSkills.map(skill => skill.name);
                        });
                });

                setSkillsData(groupedDataForUi);
                setCategories(categoriesArray);
                if (categoriesArray.length > 0) setActiveCategory(categoriesArray[0]);

                if (Array.isArray(profiles)) {
                    const activeUser = profiles.find((p: any) => {
                        const name = p.wtw_colleaguename || p.wtw_name || '';
                        const generatedSlug = name.toLowerCase().replace(/\s+/g, '-');
                        return generatedSlug === slug;
                    });

                    if (activeUser) {
                        setCurrentUserProfile(activeUser);
                        const profileId = activeUser.wtw_colleagueprofileid;

                        // ✅ Passing the IGetAllOptions object
                        const assessmentsResult = await Wtw_skillassessmentsService.getAll({
                            filter: `_wtw_colleague_value eq ${profileId}`
                        });

                        const userAssessments = assessmentsResult.data || assessmentsResult;
                        console.log("Fetched Assessments for User:", userAssessments);
                        // const userAssessments = Array.isArray(assessments)
                        //     ? assessments.filter((a: any) => a._wtw_colleague_value === profileId || a._wtw_colleagueprofile_value === profileId)
                        //     : [];

                        const loadedSkillsState: Record<string, any> = {};

                        userAssessments.forEach((a: any) => {
                            const skillId = a._wtw_skill_value || a._wtw_skilllibrary_value;
                            const skillName = Object.keys(skillMap.current).find(key => skillMap.current[key] === skillId);

                            if (skillName) {
                                assessmentMap.current[skillName] = a.wtw_skillassessmentid;

                                loadedSkillsState[skillName] = {
                                    rating: INT_TO_LEVEL[a.wtw_proficiency] || 'N/A',
                                    interested: a.wtw_isfavorite || false,
                                    updatedOn: a.modifiedon || new Date().toISOString()
                                };
                            }
                        });

                        setHistoryNotes(activeUser.wtw_historyandnotes || '');
                        setUserSkills(loadedSkillsState);
                    } else {
                        console.warn(`Could not find a Colleague Profile matching the URL slug: "${slug}".`);
                    }
                }

            } catch (err) {
                console.error("Service error while loading Dataverse data:", err);
            } finally {
                setIsLoading(false);
            }
        }

        if (slug) {
            loadDataverseData();
        }
    }, [slug]);

    // UPDATED: Flattens the nested dictionary to correctly calculate completion percentages
    const { percentage, pendingCount } = useMemo(() => {
        if (Object.keys(skillsData).length === 0) return { percentage: 0, pendingCount: 0 };

        const allSkills = Object.values(skillsData).flatMap(subCats => Object.values(subCats).flat());
        const accessedCount = allSkills.filter(skill => userSkills[skill]?.rating).length;

        return {
            percentage: Math.round((accessedCount / allSkills.length) * 100) || 0,
            pendingCount: allSkills.length - accessedCount
        };
    }, [userSkills, skillsData]);

    const handleUpdateRating = useCallback((skill: string, rating: ProficiencyLevel) => {
        setUserSkills(prev => ({
            ...prev,
            [skill]: { ...prev[skill], rating, updatedOn: new Date().toISOString() }
        }));
    }, []);

    const handleToggleHeart = useCallback((skill: string) => {
        setUserSkills(prev => ({
            ...prev,
            [skill]: { ...prev[skill], interested: !prev[skill]?.interested, updatedOn: new Date().toISOString() }
        }));
    }, []);

    const handleBulkUpdate = useCallback((skillsList: string[], rating: ProficiencyLevel) => {
        setUserSkills(prev => {
            const updated = { ...prev };
            const now = new Date().toISOString();

            skillsList.forEach(skill => {
                updated[skill] = {
                    ...updated[skill],
                    rating,
                    updatedOn: now
                };
            });

            return updated;
        });
    }, []);

    const handleHistoryChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setHistoryNotes(e.target.value);
    }, []);

    const handleSave = async () => {
        setIsSaving(true);

        try {
            const profileId = currentUserProfile?.wtw_colleagueprofileid;

            if (!profileId) {
                console.error("Cannot save: No active user profile loaded.");
                return;
            }

            await Wtw_colleagueprofilesService.update(profileId, {
                wtw_historyandnotes: historyNotes
            } as any);

            for (const [skillName, details] of Object.entries(userSkills)) {
                const existingAssessmentId = assessmentMap.current[skillName];
                const skillId = skillMap.current[skillName];

                if (!skillId) continue;

                const proficiencyInt = details.rating ? LEVEL_TO_INT[details.rating as ProficiencyLevel] : 894790000;

                if (existingAssessmentId) {
                    await Wtw_skillassessmentsService.update(existingAssessmentId, {
                        wtw_proficiency: proficiencyInt,
                        wtw_isfavorite: details.interested || false
                    } as any);
                } else if (details.rating || details.interested) {
                    const newAssessment = await Wtw_skillassessmentsService.create({
                        wtw_skillassessment1: `${currentUserProfile.wtw_colleaguename || currentUserProfile.wtw_name} - ${skillName}`,
                        wtw_proficiency: proficiencyInt,
                        wtw_isfavorite: details.interested || false,
                        "wtw_Colleague@odata.bind": `/wtw_colleagueprofiles(${profileId})`,
                        "wtw_Skill@odata.bind": `/wtw_skilllibraries(${skillId})`
                    } as any);

                    const newId = newAssessment?.data?.wtw_skillassessmentid || (newAssessment as any)?.wtw_skillassessmentid;
                    if (newId) {
                        assessmentMap.current[skillName] = newId;
                    }
                }
            }

            setTimeout(() => setIsSaving(false), 2000);

        } catch (error) {
            console.error("Failed to save to Dataverse:", error);
            setIsSaving(false);
            alert("Failed to save. Please check the console for details.");
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#622F88] border-t-transparent"></div>
                    <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">Loading Profile...</p>
                </div>
            </div>
        );
    }

    if (!isLoading && !currentUserProfile) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Profile Not Found</h2>
                    <p className="text-slate-500">We couldn't find a colleague matching "{slug}".</p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-6 px-6 py-2 bg-[#622F88] text-white rounded-lg font-bold shadow-md hover:bg-[#4C1D95] transition-colors"
                    >
                        Return to List
                    </button>
                </div>
            </div>
        );
    }

    // Retrieve subcategories for the active tab (fallback to empty object)
    const activeSubcategories = skillsData[activeCategory] || {};

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-200 font-sans">
            <header className="bg-gradient-to-r from-[#622F88] to-[#4C1D95] text-white flex-shrink-0 z-50 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl transform-gpu"></div>
                <div className="max-w-[1920px] mx-auto px-6 py-5 flex justify-between items-center relative z-10">

                    <div className="flex items-center gap-4 sm:gap-5">
                        <button
                            onClick={() => navigate('/')}
                            className="group flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all shadow-sm backdrop-blur-sm transform-gpu active:scale-95"
                            title="Return to Colleague List"
                        >
                            <svg className="w-5 h-5 text-white transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>

                        <div className="w-1.5 h-12 bg-white/40 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)] hidden sm:block"></div>

                        <div>
                            <h1 className="text-xl font-extrabold tracking-tight">Skills Intelligence</h1>
                            <div className="flex items-center gap-3 mt-1.5">
                                <div className="w-40 bg-black/20 h-2 rounded-full overflow-hidden backdrop-blur-sm border border-white/10 transform-gpu">
                                    <div className="bg-gradient-to-r from-emerald-400 to-emerald-300 h-full transition-all duration-700 ease-out" style={{ width: `${percentage}%` }}></div>
                                </div>
                                <p className="text-xs font-semibold tracking-wide text-emerald-50">{percentage}% COMPLETE</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 lg:gap-5">
                        <div className="text-right hidden md:flex flex-col items-end">
                            <p className="text-xs font-bold text-white/90 tracking-tight mb-1">
                                {currentUserProfile?.wtw_colleaguename || currentUserProfile?.wtw_name || 'No User Selected'} | {currentUserProfile?.wtw_jobrole || 'No Role'}
                            </p>
                            <div className="bg-amber-400/20 px-2.5 py-1 rounded-md border border-amber-400/30 inline-block backdrop-blur-sm transform-gpu">
                                <p className="text-[10px] font-bold text-amber-200 tracking-wide">{pendingCount} PENDING SKILLS</p>
                            </div>
                        </div>

                        <button onClick={toggleTheme} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 p-2.5 rounded-lg transition-all shadow-sm backdrop-blur-sm transform-gpu active:scale-95">
                            {isDark ? (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            ) : (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                            )}
                        </button>

                        <button onClick={handleSave} className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm backdrop-blur-sm transform-gpu active:scale-95 flex items-center gap-2 ${isSaving ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'}`}>
                            {isSaving ? (
                                <><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> <span className="hidden sm:inline">Saved!</span></>
                            ) : (
                                <><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg> <span className="hidden sm:inline">Save Profile</span></>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            <section className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 z-40 transition-colors duration-200">
                <div className="max-w-[1920px] mx-auto">
                    <nav className="flex px-6 pt-2 overflow-x-auto">
                        {categories.map(cat => (
                            <button key={cat} onClick={() => setActiveCategory(cat)} className={`flex-1 min-w-max py-4 px-4 text-xs font-semibold uppercase tracking-wider transition-colors relative ${activeCategory === cat ? 'text-[#622F88] dark:text-purple-400 font-extrabold' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                                {cat}
                                {activeCategory === cat && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[3px] bg-[#622F88] dark:bg-purple-400 rounded-t-sm"></span>}
                            </button>
                        ))}
                    </nav>

                    <div className="bg-slate-50/80 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700 px-6 py-3 flex flex-wrap gap-4 justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Proficiency Guide</span>
                        <div className="flex flex-wrap gap-4 lg:gap-6">
                            {[
                                { label: 'N/A', color: 'bg-slate-400' },
                                { label: 'Potential', color: 'bg-sky-400' },
                                { label: 'Exposure', color: 'bg-indigo-400' },
                                { label: 'Experience', color: 'bg-emerald-500' },
                                { label: 'Expert', color: 'bg-[#622F88]' },
                                { label: 'Consulting', color: 'bg-slate-900 dark:bg-slate-100' }
                            ].map(guide => (
                                <div key={guide.label} className="flex items-center gap-2">
                                    <span className={`w-3 h-3 rounded-full shadow-sm ${guide.color}`}></span>
                                    <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">{guide.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <main className="flex-1 overflow-y-auto p-6 lg:p-8 pb-24">
                <div className="max-w-[1920px] mx-auto flex flex-col gap-10">
                    {Object.entries(activeSubcategories)
                        .map(([subCat, skills]) => (
                            <div key={subCat} className="flex flex-col gap-5">

                                <div className="flex items-center gap-4 group">
                                    <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">{subCat}</h2>
                                    <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>

                                    <div className="relative opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                                        <select
                                            className="text-[10px] font-bold text-[#622F88] dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-md py-1.5 pl-3 pr-7 appearance-none focus:outline-none focus:ring-2 focus:ring-purple-300 cursor-pointer shadow-sm"
                                            defaultValue=""
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    handleBulkUpdate(skills, e.target.value as ProficiencyLevel);
                                                    e.target.value = "";
                                                }
                                            }}
                                        >
                                            <option value="" disabled>Bulk Set All...</option>
                                            <option value="N/A">Set All to N/A</option>
                                            <option value="Potential">Set All to Potential</option>
                                            <option value="Exposure">Set All to Exposure</option>
                                            <option value="Experience">Set All to Experience</option>
                                            <option value="Expert">Set All to Expert</option>
                                            <option value="Consulting">Set All to Consulting</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#622F88] dark:text-purple-400">
                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                                    {skills.map(skill => (
                                        <SkillCard
                                            key={skill}
                                            skill={skill}
                                            details={userSkills[skill] || DEFAULT_SKILL_STATE}
                                            onUpdateRating={handleUpdateRating}
                                            onToggleHeart={handleToggleHeart}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                </div>

                <div className="max-w-[1920px] mx-auto mt-12 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors duration-200">
                    <div className="flex items-center gap-2 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Project History & Notes</h3>
                    </div>
                    <textarea
                        value={historyNotes}
                        onChange={handleHistoryChange}
                        className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-[#622F88] focus:ring-4 focus:ring-purple-300/20 transition-all outline-none text-sm min-h-[140px] resize-y text-slate-700 dark:text-slate-200 dark:placeholder-slate-500"
                        placeholder="Briefly list key projects or initiatives where you applied these skills..."
                    />
                </div>
            </main>
        </div>
    );
};