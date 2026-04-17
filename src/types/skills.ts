export type ProficiencyLevel = 'N/A' | 'Potential' | 'Exposure' | 'Experience' | 'Expert' | 'Consulting';
export type Category = 'BC' | 'Internal' | 'Tech' | 'Soft';

export interface SkillDetails {
    rating: ProficiencyLevel | null;
    interested: boolean;
    updatedOn: string | null;
}

export interface UserState {
    history: string;
    skills: Record<string, SkillDetails>;
}

// Translates the Dataverse Choice Integers back into our UI Letters
export const INT_TO_LEVEL: Record<number, ProficiencyLevel> = {
    894790000: 'N/A',
    894790001: 'Potential',
    894790002: 'Exposure',
    894790003: 'Experience',
    894790004: 'Expert',
    894790005: 'Consulting'
};