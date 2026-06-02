import type { ProficiencyLevel } from '../../types/skills';

export interface HeatmapColleague {
    name: string;
    role: string;
    matrix: Record<string, ProficiencyLevel>;
}

export interface RadarDimension {
    key: string;
    label: string;
    parentCategory?: string;
    skillsCount: number;
    avgWeight: number;
    scorePct: number;
    strongCoveragePct: number;
}

export interface RadarMetricsResult {
    isGranularMode: boolean;
    radarDimensions: RadarDimension[];
    weakestDimensions: RadarDimension[];
}
