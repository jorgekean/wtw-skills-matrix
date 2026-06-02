import { useMemo } from 'react';
import { buildRadarMetrics } from './radarMetrics';
import { TeamRadarChart } from './TeamRadarChart';
import { TeamRadarHeader } from './TeamRadarHeader';
import { TopGapsPanel } from './TopGapsPanel';
import type { HeatmapColleague } from './types';

export const TeamHeatMap = ({
    colleagues,
    skillsMap
}: {
    colleagues: HeatmapColleague[];
    skillsMap: Record<string, string[]>;
}) => {
    const { isGranularMode, radarDimensions, weakestDimensions } = useMemo(
        () => buildRadarMetrics(colleagues, skillsMap),
        [colleagues, skillsMap]
    );

    if (radarDimensions.length === 0 || colleagues.length === 0) {
        return <div className="p-8 text-center text-slate-400 font-bold bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">No data available to generate team category radar.</div>;
    }

    return (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-5 sm:p-6">
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 min-w-0">
                    <TeamRadarHeader isGranularMode={isGranularMode} />
                    <div className="mt-1 w-full flex justify-center">
                        <TeamRadarChart dimensions={radarDimensions} />
                    </div>
                </div>

                <TopGapsPanel items={weakestDimensions} isGranularMode={isGranularMode} />
            </div>
        </div>
    );
};