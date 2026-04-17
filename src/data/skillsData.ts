import { type Category, type ProficiencyLevel } from '../types/skills';

// NOT USED ANYMORE

export const SKILLS_DATA: Record<Category, string[]> = {
    BC: ["Calc", "Hours Calc", "Events", "PCOMMS", "Carriers", "Reports", "Import", "Conversion", "Validations"],
    Internal: ["FUSE", "Test Tracker", "MARS", "Saturn", "Gov Portal", "SLA", "Aura Tool", "Project Eureka"],
    Tech: ["C#", "ReactJS", "SQL", "Power Apps"],
    Soft: ["Communication", "Problem Solving", "Time Management", "Mentoring"]
};

export const CATEGORIES: Category[] = ['BC', 'Internal', 'Tech', 'Soft'];

export const PROFICIENCY_LEVELS: ProficiencyLevel[] = ['N/A', 'I', 'L', 'U', 'O'];