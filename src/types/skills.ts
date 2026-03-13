export type ProficiencyLevel = 'N/A' | 'I' | 'L' | 'U' | 'O';

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