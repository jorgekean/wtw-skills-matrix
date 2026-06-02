import type { ProficiencyLevel } from '../../types/skills';

export type MatrixView = 'BC' | 'INTERNAL';

export interface Colleague {
    name: string;
    role: string;
    matrix: Record<string, ProficiencyLevel>;
    fav: string;
    tech: string[];
    matchScore?: number;
}

export interface TeamGapRoleBreakdown {
    role: string;
    maxWeight: number;
    topLevelStr: string;
    experts: string[];
    hasGap: boolean;
}

export interface TeamGapAnalysisItem {
    skill: string;
    roleBreakdown: TeamGapRoleBreakdown[];
    isTargeted: boolean;
    overallGap: boolean;
    targetStr: string;
}
