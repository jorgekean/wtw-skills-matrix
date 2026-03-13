import { useState } from 'react';
// IMPORTANT: Update this import path to point to your actual generated service file!
import { Wtw_skilllibrariesService } from '../generated/services/Wtw_skilllibrariesService';

const COMPONENTS = [
    "Automation", "Billing", "Carriers - BC3", "Carriers - BC4", "CMS",
    "COBRA", "Conversion", "Data Warehouse", "EOI", "ESS",
    "ESS Evaluate", "ESS Mobile", "Events", "HW Calc", "Import",
    "Payroll", "Pers Comms", "Premiums", "Reports", "Web Admin",
    "Validation", "Individual Marketplace"
];

export function SeedData() {
    const [isSeeding, setIsSeeding] = useState(false);
    const [status, setStatus] = useState("Ready to seed.");

    async function runSeed() {
        setIsSeeding(true);
        let successCount = 0;
        let failCount = 0;

        for (const skillName of COMPONENTS) {
            setStatus(`Adding: ${skillName}...`);

            try {
                // Using the generated service to handle Auth & POST
                const result = await Wtw_skilllibrariesService.create({
                    wtw_skillname: skillName,
                } as any);

                // The generated service usually returns the created object or a success flag
                if (result) {
                    successCount++;
                } else {
                    failCount++;
                }
            } catch (error) {
                console.error(`Failed to create ${skillName}:`, error);
                failCount++;
            }
        }

        setStatus(`Finished! Successfully added ${successCount} skills. Failed: ${failCount}`);
        setIsSeeding(false);
    }

    return (
        <div className="p-6 max-w-md mx-auto mt-10 bg-white rounded-2xl shadow-sm border border-slate-200 text-center">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Dataverse Seeder</h2>
            <p className="text-sm text-slate-500 mb-6">This will push {COMPONENTS.length} rows to wtw_SkillLibrary.</p>

            <button
                onClick={runSeed}
                disabled={isSeeding}
                className="bg-[#622F88] hover:bg-[#4C1D95] text-white px-6 py-2.5 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
            >
                {isSeeding ? "Processing..." : "Start Seeding"}
            </button>

            <p className="mt-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {status}
            </p>
        </div>
    );
}