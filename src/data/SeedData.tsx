import { useState } from 'react';
// IMPORTANT: Update this import path to point to your actual generated service file!
import { Wtw_skilllibrariesService } from '../generated/services/Wtw_skilllibrariesService';

const SKILL_DATA = [
    {
        "subCategory": "Plan Design/Calc",
        "names": [
            "Eligibility",
            "30-Hour calculation",
            "Non-standard benefits",
            "Pre-65 Retiree",
            "Post-65 Retiree",
            "Loading Rates",
            "LTD",
            "STD",
            "EOI calculation",
            "EOI Decision File",
            "Events",
            "AE Live Date",
            "Mid-Year Live Date"
        ]
    },
    {
        "subCategory": "Conversion",
        "names": [
            "WTW Standard Conversion Layout",
            "Non-WTW Conversion Layout",
            "Hours Conversion",
            "901 Analysis"
        ]
    },
    {
        "subCategory": "HRIS/Import",
        "names": [
            "ATT layout",
            "ATT (SQL)",
            "Non-WTW file layout",
            "Hours import",
            "HSA status",
            "Image import",
            "Validation"
        ]
    },
    {
        "subCategory": "ESS/Web Admin",
        "names": [
            "ESS New",
            "Non-ESS New",
            "SSO In",
            "SSO Out",
            "ESS Customization",
            "Embark Integration",
            "Web Admin",
            "Plan Sponsor"
        ]
    },
    {
        "subCategory": "System Comms",
        "names": [
            "Triggers",
            "Communication",
            "Communication",
            "Communication",
            "Communication"
        ]
    },
    {
        "subCategory": "Reporting",
        "names": [
            "SSRS Reporting",
            "Batch Reporting",
            "Izenda",
            "Custom Reporting"
        ]
    },
    {
        "subCategory": "Ancillary Services",
        "names": [
            "WTW COBRA",
            "Non-WTW COBRA",
            "Direct Billing",
            "WTW Benefit Accounts",
            "Non-WTW Benefit Accounts",
            "Event Verification",
            "Dependent Verification",
            "HCR Reporting"
        ]
    },
    {
        "subCategory": "Exports/Carriers",
        "names": [
            "Carrier",
            "Port & Conversion",
            "Premium Reporting",
            "Vendor Payment",
            "Verification",
            "APIs"
        ]
    },
    {
        "subCategory": "Payroll",
        "names": [
            "TDS Payroll",
            "Payroll"
        ]
    },
    {
        "subCategory": "Admin/ Processes",
        "names": [
            "Simon Integration",
            "Passthrough",
            "Admin Procedure",
            "Admin Guide",
            "Overage",
            "Age 65",
            "Processes",
            "SFTP Setup"
        ]
    },
    {
        "subCategory": "IM",
        "names": [
            "Calc",
            "Export",
            "Reconciliation",
            "HRDQs"
        ]
    },
    {
        "subCategory": "Quality/Governance",
        "names": [
            "ATT (SQL)",
            "ATT (Action Base)",
            "File Automation",
            "CDQ"
        ]
    }
];

export function SeedData() {
    const [isSeeding, setIsSeeding] = useState(false);
    const [status, setStatus] = useState("Ready to seed.");

    // Calculate total skills for the UI description
    const totalSkills = SKILL_DATA.reduce((total, category) => total + category.names.length, 0);

    async function runSeed() {
        setIsSeeding(true);
        let successCount = 0;
        let failCount = 0;

        for (const category of SKILL_DATA) {
            for (const skillName of category.names) {
                setStatus(`Adding: ${skillName} (${category.subCategory})...`);

                try {
                    // Using the generated service to handle Auth & POST
                    const result = await Wtw_skilllibrariesService.create({
                        wtw_skillname: skillName,

                        // NOTE: Ensure 'wtw_subcategory' exactly matches your Dataverse column's logical name!
                        wtw_subcategory: category.subCategory
                    } as any);

                    // The generated service usually returns the created object or a success flag
                    if (result) {
                        successCount++;
                    } else {
                        failCount++;
                    }
                } catch (error) {
                    console.error(`Failed to create ${skillName} in ${category.subCategory}:`, error);
                    failCount++;
                }
            }
        }

        setStatus(`Finished! Successfully added ${successCount} skills. Failed: ${failCount}`);
        setIsSeeding(false);
    }

    return (
        <div className="p-6 max-w-md mx-auto mt-10 bg-white rounded-2xl shadow-sm border border-slate-200 text-center">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Dataverse Seeder</h2>
            <p className="text-sm text-slate-500 mb-6">This will push {totalSkills} skills to the Library.</p>

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