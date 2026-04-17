import { useState } from 'react';
// Make sure these imports match the paths in your generated folder!
import { Wtw_skilllibrariesService } from '../generated/services/Wtw_skilllibrariesService';
import { Wtw_colleagueprofilesService } from '../generated/services/Wtw_colleagueprofilesService';
import { Wtw_skillassessmentsService } from '../generated/services/Wtw_skillassessmentsService';

// UPDATED SAMPLES: Replaced old skill names with your new library names, and updated to the 6-tier scale
const SAMPLES = [
    { name: "Alice Thompson", role: "DEV", fav: "ESS New", tech: ["C#", "ReactJS", "SQL"], matrix: { "Eligibility": "Expert", "30-Hour calculation": "Experience", "WTW Standard Conversion Layout": "Consulting", "Hours import": "Experience", "ESS New": "Expert", "Triggers": "Potential", "SSRS Reporting": "N/A" } },
    { name: "Mark Sullivan", role: "QA", fav: "Validation", tech: ["SQL", "Power Apps"], matrix: { "Eligibility": "Exposure", "30-Hour calculation": "Potential", "WTW Standard Conversion Layout": "N/A", "Validation": "Consulting", "ESS New": "Experience", "Triggers": "Expert", "SSRS Reporting": "Experience" } },
    { name: "Sita Patel", role: "BA", fav: "Triggers", tech: ["Excel", "Visio"], matrix: { "Eligibility": "Experience", "30-Hour calculation": "Expert", "WTW Standard Conversion Layout": "Exposure", "Hours import": "N/A", "ESS New": "Experience", "Triggers": "Consulting", "SSRS Reporting": "Expert" } },
    // { name: "James Wilson", role: "DEV", fav: "WTW Standard Conversion Layout", tech: ["C#", "SQL", "Azure"], matrix: { "Eligibility": "Potential", "30-Hour calculation": "N/A", "WTW Standard Conversion Layout": "Expert", "Hours import": "Consulting", "ESS New": "Exposure", "Triggers": "Experience", "SSRS Reporting": "Potential" } },
    // { name: "Elena Rodriguez", role: "QA", fav: "ATT (SQL)", tech: ["Selenium", "SQL"], matrix: { "Eligibility": "Expert", "30-Hour calculation": "Experience", "Validation": "Consulting", "ATT (SQL)": "Expert", "SSO In": "Experience", "Triggers": "Exposure", "Izenda": "Potential" } },
    // { name: "Chen Wei", role: "DEV", fav: "SSO In", tech: ["ReactJS", "NodeJS"], matrix: { "Eligibility": "Experience", "30-Hour calculation": "N/A", "WTW Standard Conversion Layout": "Consulting", "Hours import": "N/A", "SSO In": "Expert", "Triggers": "Experience", "SSRS Reporting": "N/A" } },
    // { name: "Sarah Jenkins", role: "BA", fav: "SSRS Reporting", tech: ["SQL", "Tableau"], matrix: { "Eligibility": "Potential", "30-Hour calculation": "Consulting", "WTW Standard Conversion Layout": "Experience", "Hours import": "Exposure", "ESS New": "Potential", "Triggers": "N/A", "SSRS Reporting": "Consulting" } },
    // { name: "Tom Baker", role: "Project Manager", fav: "Simon Integration", tech: ["C#", "Architecture"], matrix: { "Eligibility": "Experience", "30-Hour calculation": "Experience", "WTW Standard Conversion Layout": "Experience", "Simon Integration": "Expert", "ESS New": "Experience", "Triggers": "Experience", "SSRS Reporting": "Exposure" } },
    // { name: "Amira Hassan", role: "DEV", fav: "Hours import", tech: ["C#", "ReactJS"], matrix: { "Eligibility": "Expert", "30-Hour calculation": "Potential", "WTW Standard Conversion Layout": "N/A", "Hours import": "Consulting", "ESS New": "Expert", "Triggers": "Potential", "SSRS Reporting": "N/A" } },
    // { name: "Lucia Rossi", role: "BA", fav: "Eligibility", tech: ["Excel", "Jira"], matrix: { "Eligibility": "Consulting", "30-Hour calculation": "Experience", "WTW Standard Conversion Layout": "Potential", "Hours import": "N/A", "ESS New": "Experience", "Triggers": "Exposure", "SSRS Reporting": "Experience" } },
];

// UPDATED PROFICIENCY MAP: Uses your 6 new choices.
// !!! IMPORTANT: Verify these exact integers match your Dataverse Choice column !!!
const PROFICIENCY_MAP: Record<string, number> = {
    'N/A': 894790000,
    'Potential': 894790001,
    'Exposure': 894790002,
    'Experience': 894790003,
    'Expert': 894790004,
    'Consulting': 894790005
};

export function SeedColleagues() {
    const [isSeeding, setIsSeeding] = useState(false);
    const [status, setStatus] = useState("Ready to seed Profiles and Assessments.");

    async function runSeed() {
        setIsSeeding(true);
        setStatus("Fetching Skill Library mapping...");

        try {
            // 1. Fetch all skills to get their GUIDs
            const skillsResult = await Wtw_skilllibrariesService.getAll();
            const skillsData = skillsResult.data || skillsResult;

            const skillMap: Record<string, string> = {};
            skillsData.forEach((skill: any) => {
                const name = skill.wtw_skillname || skill.wtw_name;
                const id = skill.wtw_skilllibraryid; // This is the unique GUID
                if (name && id) skillMap[name] = id;
            });

            let profilesCreated = 0;
            let assessmentsCreated = 0;

            // 2. Loop through every colleague
            for (const colleague of SAMPLES) {
                setStatus(`Creating Profile for ${colleague.name}...`);

                // Create the Profile record
                const profileResult = await Wtw_colleagueprofilesService.create({
                    wtw_colleaguename: colleague.name,
                    wtw_jobrole: colleague.role
                } as any);

                const profileId = (profileResult as any)?.wtw_colleagueprofileid || profileResult?.data?.wtw_colleagueprofileid;
                console.log(`Created profile for ${colleague.name} with ID: ${profileId}`);

                if (profileId) {
                    profilesCreated++;

                    // 3. Loop through their skills to create Assessment rows
                    const skillNames = Object.keys(colleague.matrix);

                    for (const skillName of skillNames) {
                        const skillGuid = skillMap[skillName];

                        // It will safely skip any skills that weren't successfully seeded earlier
                        if (skillGuid) {
                            setStatus(`Linking ${skillName} to ${colleague.name}...`);

                            const levelString = colleague.matrix[skillName as keyof typeof colleague.matrix];
                            const proficiencyInt = PROFICIENCY_MAP[levelString as string];
                            const isFavorite = colleague.fav === skillName;

                            // 4. Create the junction record
                            await Wtw_skillassessmentsService.create({
                                wtw_skillassessment1: `${colleague.name} - ${skillName}`,
                                wtw_proficiency: proficiencyInt,
                                wtw_isfavorite: isFavorite,

                                // Binding the Lookups via OData Navigation Properties
                                "wtw_Colleague@odata.bind": `/wtw_colleagueprofiles(${profileId})`,
                                "wtw_Skill@odata.bind": `/wtw_skilllibraries(${skillGuid})`
                            } as any);

                            assessmentsCreated++;
                        } else {
                            console.warn(`Could not find skill "${skillName}" in Dataverse library. Skipping.`);
                        }
                    }
                }
            }

            setStatus(`Success! Created ${profilesCreated} Profiles and ${assessmentsCreated} Assessments.`);

        } catch (error) {
            console.error("Seeding failed:", error);
            setStatus("Error occurred. Check console.");
        } finally {
            setIsSeeding(false);
        }
    }

    return (
        <div className="p-6 max-w-md mx-auto mt-10 bg-white rounded-2xl shadow-sm border border-slate-200 text-center">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Colleague Matrix Seeder</h2>
            <p className="text-sm text-slate-500 mb-6">Seeds Profiles and Assessment Junctions.</p>

            <button
                onClick={runSeed}
                disabled={isSeeding}
                className="bg-[#622F88] hover:bg-[#4C1D95] text-white px-6 py-2.5 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
            >
                {isSeeding ? "Processing..." : "Start Seeding"}
            </button>

            <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider h-8 flex items-center justify-center">
                {status}
            </p>
        </div>
    );
}