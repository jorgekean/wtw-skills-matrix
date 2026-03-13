import { useState } from 'react';
// Make sure these imports match the paths in your generated folder!
import { Wtw_skilllibrariesService } from '../generated/services/Wtw_skilllibrariesService';
import { Wtw_colleagueprofilesService } from '../generated/services/Wtw_colleagueprofilesService';
import { Wtw_skillassessmentsService } from '../generated/services/Wtw_skillassessmentsService';

const SAMPLES = [
    { name: "Alice Thompson", role: "DEV", fav: "ReactJS", tech: ["C#", "ReactJS", "SQL"], matrix: { "Automation": "U", "Billing": "N/A", "Carriers - BC3": "N/A", "Carriers - BC4": "I", "CMS": "L", "COBRA": "N/A", "Conversion": "O", "Data Warehouse": "I", "EOI": "L", "ESS": "O", "ESS Evaluate": "U", "ESS Mobile": "O", "Events": "U", "HW Calc": "O", "Import": "U", "Payroll": "N/A", "Pers Comms": "N/A", "Premiums": "I", "Reports": "I", "Web Admin": "L", "Validation": "L", "Individual Marketplace": "N/A", "FUSE": "O", "Test Tracker": "N/A", "MARS": "N/A", "Saturn": "L", "Gov Portal": "N/A", "SLA": "I", "Aura Tool": "U", "Project Eureka": "O" } },
    { name: "Mark Sullivan", role: "QA", fav: "SQL", tech: ["SQL", "Power Apps"], matrix: { "Automation": "I", "Billing": "L", "Carriers - BC3": "L", "Carriers - BC4": "L", "CMS": "I", "COBRA": "O", "Conversion": "I", "Data Warehouse": "U", "EOI": "N/A", "ESS": "I", "ESS Evaluate": "L", "ESS Mobile": "N/A", "Events": "I", "HW Calc": "I", "Import": "L", "Payroll": "L", "Pers Comms": "L", "Premiums": "U", "Reports": "U", "Web Admin": "I", "Validation": "O", "Individual Marketplace": "L", "FUSE": "L", "Test Tracker": "O", "MARS": "U", "Saturn": "U", "Gov Portal": "I", "SLA": "N/A", "Aura Tool": "N/A", "Project Eureka": "N/A" } },
    { name: "Sita Patel", role: "BA", fav: "Pers Comms", tech: ["Excel", "Visio"], matrix: { "Automation": "L", "Billing": "U", "Carriers - BC3": "U", "Carriers - BC4": "U", "CMS": "O", "COBRA": "L", "Conversion": "I", "Data Warehouse": "N/A", "EOI": "U", "ESS": "L", "ESS Evaluate": "I", "ESS Mobile": "L", "Events": "L", "HW Calc": "I", "Import": "N/A", "Payroll": "O", "Pers Comms": "O", "Premiums": "U", "Reports": "U", "Web Admin": "U", "Validation": "N/A", "Individual Marketplace": "O", "FUSE": "N/A", "Test Tracker": "N/A", "MARS": "L", "Saturn": "N/A", "Gov Portal": "U", "SLA": "O", "Aura Tool": "I", "Project Eureka": "N/A" } },
    { name: "James Wilson", role: "DEV", fav: "C#", tech: ["C#", "SQL", "Azure"], matrix: { "Automation": "O", "Billing": "N/A", "Carriers - BC3": "I", "Carriers - BC4": "I", "CMS": "L", "COBRA": "I", "Conversion": "L", "Data Warehouse": "O", "EOI": "N/A", "ESS": "U", "ESS Evaluate": "L", "ESS Mobile": "I", "Events": "I", "HW Calc": "L", "Import": "O", "Payroll": "I", "Pers Comms": "U", "Premiums": "L", "Reports": "L", "Web Admin": "O", "Validation": "I", "Individual Marketplace": "N/A", "FUSE": "U", "Test Tracker": "N/A", "MARS": "N/A", "Saturn": "I", "Gov Portal": "N/A", "SLA": "L", "Aura Tool": "N/A", "Project Eureka": "I" } },
    { name: "Elena Rodriguez", role: "QA", fav: "Test Tracker", tech: ["Selenium", "SQL"], matrix: { "Automation": "O", "Billing": "I", "Carriers - BC3": "I", "Carriers - BC4": "N/A", "CMS": "I", "COBRA": "I", "Conversion": "N/A", "Data Warehouse": "L", "EOI": "L", "ESS": "U", "ESS Evaluate": "O", "ESS Mobile": "U", "Events": "U", "HW Calc": "N/A", "Import": "I", "Payroll": "I", "Pers Comms": "I", "Premiums": "N/A", "Reports": "L", "Web Admin": "I", "Validation": "O", "Individual Marketplace": "I", "FUSE": "I", "Test Tracker": "O", "MARS": "I", "Saturn": "I", "Gov Portal": "N/A", "SLA": "N/A", "Aura Tool": "I", "Project Eureka": "N/A" } },
    { name: "Chen Wei", role: "DEV", fav: "ReactJS", tech: ["ReactJS", "NodeJS"], matrix: { "Automation": "L", "Billing": "N/A", "Carriers - BC3": "N/A", "Carriers - BC4": "N/A", "CMS": "U", "COBRA": "N/A", "Conversion": "O", "Data Warehouse": "N/A", "EOI": "N/A", "ESS": "O", "ESS Evaluate": "O", "ESS Mobile": "O", "Events": "L", "HW Calc": "U", "Import": "L", "Payroll": "N/A", "Pers Comms": "N/A", "Premiums": "L", "Reports": "N/A", "Web Admin": "U", "Validation": "L", "Individual Marketplace": "U", "FUSE": "L", "Test Tracker": "I", "MARS": "O", "Saturn": "I", "Gov Portal": "N/A", "SLA": "N/A", "Aura Tool": "U", "Project Eureka": "L" } },
    { name: "Sarah Jenkins", role: "BA", fav: "Gov Portal", tech: ["SQL", "Tableau"], matrix: { "Automation": "I", "Billing": "O", "Carriers - BC3": "O", "Carriers - BC4": "O", "CMS": "L", "COBRA": "O", "Conversion": "N/A", "Data Warehouse": "U", "EOI": "O", "ESS": "I", "ESS Evaluate": "N/A", "ESS Mobile": "N/A", "Events": "N/A", "HW Calc": "N/A", "Import": "N/A", "Payroll": "O", "Pers Comms": "I", "Premiums": "O", "Reports": "O", "Web Admin": "I", "Validation": "I", "Individual Marketplace": "O", "FUSE": "N/A", "Test Tracker": "N/A", "MARS": "L", "Saturn": "I", "Gov Portal": "O", "SLA": "L", "Aura Tool": "N/A", "Project Eureka": "I" } },
    { name: "Tom Baker", role: "Project Manager", fav: "Aura Tool", tech: ["C#", "Architecture"], matrix: { "Automation": "U", "Billing": "L", "Carriers - BC3": "L", "Carriers - BC4": "L", "CMS": "U", "COBRA": "I", "Conversion": "O", "Data Warehouse": "O", "EOI": "I", "ESS": "L", "ESS Evaluate": "L", "ESS Mobile": "L", "Events": "L", "HW Calc": "O", "Import": "L", "Payroll": "L", "Pers Comms": "L", "Premiums": "U", "Reports": "U", "Web Admin": "O", "Validation": "U", "Individual Marketplace": "I", "FUSE": "L", "Test Tracker": "I", "MARS": "N/A", "Saturn": "N/A", "Gov Portal": "L", "SLA": "I", "Aura Tool": "O", "Project Eureka": "U" } },
    { name: "Amira Hassan", role: "DEV", fav: "FUSE", tech: ["C#", "ReactJS"], matrix: { "Automation": "U", "Billing": "I", "Carriers - BC3": "N/A", "Carriers - BC4": "N/A", "CMS": "O", "COBRA": "N/A", "Conversion": "I", "Data Warehouse": "L", "EOI": "N/A", "ESS": "U", "ESS Evaluate": "I", "ESS Mobile": "U", "Events": "I", "HW Calc": "I", "Import": "L", "Payroll": "I", "Pers Comms": "U", "Premiums": "I", "Reports": "N/A", "Web Admin": "O", "Validation": "I", "Individual Marketplace": "L", "FUSE": "U", "Test Tracker": "N/A", "MARS": "I", "Saturn": "L", "Gov Portal": "N/A", "SLA": "N/A", "Aura Tool": "L", "Project Eureka": "U" } },
    { name: "Lucia Rossi", role: "BA", fav: "SLA", tech: ["Excel", "Jira"], matrix: { "Automation": "I", "Billing": "U", "Carriers - BC3": "U", "Carriers - BC4": "U", "CMS": "L", "COBRA": "U", "Conversion": "N/A", "Data Warehouse": "I", "EOI": "O", "ESS": "L", "ESS Evaluate": "I", "ESS Mobile": "N/A", "Events": "N/A", "HW Calc": "N/A", "Import": "N/A", "Payroll": "U", "Pers Comms": "L", "Premiums": "U", "Reports": "I", "Web Admin": "L", "Validation": "I", "Individual Marketplace": "U", "FUSE": "N/A", "Test Tracker": "I", "MARS": "I", "Saturn": "N/A", "Gov Portal": "O", "SLA": "O", "Aura Tool": "N/A", "Project Eureka": "N/A" } },
];

// !!! IMPORTANT: YOU MUST REPLACE THESE 0s WITH YOUR ACTUAL DATAVERSE CHOICE INTEGERS !!!
// You can find these by looking at the "Choices" menu in your Power Apps environment.
const PROFICIENCY_MAP: Record<string, number> = {
    'N/A': 894790000, // Replace 0 with the integer for Needs Training
    'I': 894790001,   // Replace 0 with the integer for Trained (I)
    'L': 894790002,   // Replace 0 with the integer for Experienced (L)
    'U': 894790003,   // Replace 0 with the integer for Proficient (U)
    'O': 894790004    // Replace 0 with the integer for Expert (O)
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

                        if (skillGuid) {
                            setStatus(`Linking ${skillName} to ${colleague.name}...`);

                            const levelLetter = colleague.matrix[skillName as keyof typeof colleague.matrix];
                            const proficiencyInt = PROFICIENCY_MAP[levelLetter];
                            const isFavorite = colleague.fav === skillName;

                            // 4. Create the junction record
                            await Wtw_skillassessmentsService.create({
                                // HERE IS THE FIX: Automatically generating the required Primary Name Text
                                wtw_skillassessment1: `${colleague.name} - ${skillName}`,

                                wtw_proficiency: proficiencyInt,
                                wtw_isfavorite: isFavorite,

                                // Binding the Lookups via OData Navigation Properties
                                // Double check your Dataverse plural table names!
                                "wtw_Colleague@odata.bind": `/wtw_colleagueprofiles(${profileId})`,
                                "wtw_Skill@odata.bind": `/wtw_skilllibraries(${skillGuid})`
                            } as any);

                            assessmentsCreated++;
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