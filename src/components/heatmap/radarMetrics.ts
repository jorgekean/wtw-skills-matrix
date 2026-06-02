import { sortSubcategories } from '../../utils/subCategories';
import type { ProficiencyLevel } from '../../types/skills';
import type { HeatmapColleague, RadarDimension, RadarMetricsResult } from './types';

const LEVEL_WEIGHTS: Record<ProficiencyLevel, number> = {
    'N/A': 1,
    'Potential': 2,
    'Exposure': 3,
    'Experience': 4,
    'Expert': 5,
    'Consulting': 6
};

const MINIMUM_STRONG_LEVEL = LEVEL_WEIGHTS['Experience'];

const clampPercent = (value: number): number => Math.max(0, Math.min(100, value));

const summarizeDimension = (
    colleagues: HeatmapColleague[],
    label: string,
    skills: string[],
    parentCategory?: string
): RadarDimension | null => {
    if (skills.length === 0) {
        return null;
    }

    let totalScore = 0;
    let totalItems = 0;
    let strongCoverageCount = 0;

    colleagues.forEach((colleague) => {
        skills.forEach((skill) => {
            const level = colleague.matrix[skill] || 'N/A';
            const levelWeight = LEVEL_WEIGHTS[level];

            totalScore += levelWeight;
            totalItems += 1;

            if (levelWeight >= MINIMUM_STRONG_LEVEL) {
                strongCoverageCount += 1;
            }
        });
    });

    const avgWeight = totalItems > 0 ? totalScore / totalItems : 1;
    const normalizedPct = ((avgWeight - 1) / 5) * 100;
    const strongCoveragePct = totalItems > 0 ? (strongCoverageCount / totalItems) * 100 : 0;

    return {
        key: parentCategory ? `${parentCategory}::${label}` : label,
        label,
        parentCategory,
        skillsCount: skills.length,
        avgWeight,
        scorePct: clampPercent(normalizedPct),
        strongCoveragePct: clampPercent(strongCoveragePct)
    };
};

export const buildRadarMetrics = (
    colleagues: HeatmapColleague[],
    skillsMap: Record<string, string[]>
): RadarMetricsResult => {
    const sortedCategories = sortSubcategories(Object.keys(skillsMap));
    const isGranularMode = sortedCategories.length <= 2;

    const radarDimensions = isGranularMode
        ? sortedCategories
            .flatMap((category) => {
                const skills = skillsMap[category] || [];
                return skills.map((skill) => summarizeDimension(colleagues, skill, [skill], category));
            })
            .filter((item): item is RadarDimension => item !== null)
        : sortedCategories
            .map((category) => summarizeDimension(colleagues, category, skillsMap[category] || []))
            .filter((item): item is RadarDimension => item !== null);

    const weakestDimensions = [...radarDimensions]
        .sort((a, b) => a.scorePct - b.scorePct)
        .slice(0, 4);

    return {
        isGranularMode,
        radarDimensions,
        weakestDimensions
    };
};
