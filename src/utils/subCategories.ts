// src/utils/sortCategories.ts

const SUBCATEGORY_ORDER = [
    "Plan Design/Calc",
    "Conversion",
    "HRIS/Import",
    "ESS/Web Admin",
    "System Comms",
    "Reporting",
    "Ancillary Services",
    "Exports/Carriers",
    "Payroll",
    "Admin/ Processes",
    "IM",
    "Quality/Governance"
];

/**
 * Sorts an array of subcategory string names based on the predefined enterprise order.
 * Unknown categories are sent to the bottom and sorted alphabetically.
 */
export const sortSubcategories = (categories: string[]): string[] => {
    return [...categories].sort((a, b) => {
        // Special case: If you still want 'General' to always be at the very top, keep these two lines.
        // If you want 'General' at the bottom, just remove them.
        if (a === 'General') return -1;
        if (b === 'General') return 1;

        const indexA = SUBCATEGORY_ORDER.indexOf(a);
        const indexB = SUBCATEGORY_ORDER.indexOf(b);

        // Both items are in our strict list: sort by their defined order
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;

        // Only one item is in the strict list: prioritize it
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;

        // Neither item is in the list (e.g., a newly added category): sort alphabetically at the bottom
        return a.localeCompare(b);
    });
};