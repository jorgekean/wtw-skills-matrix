import type { RadarDimension } from './types';

const PLOT_SIZE = 520;
const CHART_PADDING = 130;
const SIZE = PLOT_SIZE + (CHART_PADDING * 2);
const CENTER_X = CHART_PADDING + (PLOT_SIZE / 2);
const CENTER_Y = CHART_PADDING + (PLOT_SIZE / 2) - 56;
const RADIUS = 190;
const RINGS = [20, 40, 60, 80, 100];

export const TeamRadarChart = ({ dimensions }: { dimensions: RadarDimension[] }) => {
    const angleStep = (Math.PI * 2) / dimensions.length;

    const radarPoints = dimensions
        .map((item, index) => {
            const angle = -Math.PI / 2 + index * angleStep;
            const scaledRadius = (item.scorePct / 100) * RADIUS;
            const x = CENTER_X + Math.cos(angle) * scaledRadius;
            const y = CENTER_Y + Math.sin(angle) * scaledRadius;
            return `${x},${y}`;
        })
        .join(' ');

    return (
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-175 h-auto" role="img" aria-label="Team category radar chart">
            {RINGS.map((ring) => {
                const ringRadius = (ring / 100) * RADIUS;
                return (
                    <circle
                        key={ring}
                        cx={CENTER_X}
                        cy={CENTER_Y}
                        r={ringRadius}
                        fill="none"
                        stroke="currentColor"
                        className="text-slate-200 dark:text-slate-700"
                        strokeDasharray={ring === 100 ? '0' : '3 3'}
                    />
                );
            })}

            {dimensions.map((item, index) => {
                const angle = -Math.PI / 2 + index * angleStep;
                const axisX = CENTER_X + Math.cos(angle) * RADIUS;
                const axisY = CENTER_Y + Math.sin(angle) * RADIUS;
                const labelX = CENTER_X + Math.cos(angle) * (RADIUS + 26);
                const labelY = CENTER_Y + Math.sin(angle) * (RADIUS + 26);
                const textAnchor = Math.abs(Math.cos(angle)) < 0.2 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end';
                const shortLabel = item.label.length > 22 ? `${item.label.slice(0, 22)}...` : item.label;

                return (
                    <g key={item.key}>
                        <line x1={CENTER_X} y1={CENTER_Y} x2={axisX} y2={axisY} stroke="currentColor" className="text-slate-200 dark:text-slate-700" />
                        <text
                            x={labelX}
                            y={labelY}
                            textAnchor={textAnchor}
                            dominantBaseline="middle"
                            className="fill-slate-600 dark:fill-slate-300 text-[11px] font-bold"
                        >
                            <tspan x={labelX} dy="-0.35em">{shortLabel}</tspan>
                            <tspan x={labelX} dy="1.15em" className="fill-slate-500 dark:fill-slate-400 text-[10px] font-semibold">{item.scorePct.toFixed(0)}%</tspan>
                        </text>
                    </g>
                );
            })}

            <polygon
                points={radarPoints}
                fill="rgba(98, 47, 136, 0.24)"
                stroke="rgb(98, 47, 136)"
                strokeWidth="2.5"
            />

            {dimensions.map((item, index) => {
                const angle = -Math.PI / 2 + index * angleStep;
                const scaledRadius = (item.scorePct / 100) * RADIUS;
                const x = CENTER_X + Math.cos(angle) * scaledRadius;
                const y = CENTER_Y + Math.sin(angle) * scaledRadius;

                return (
                    <circle
                        key={`point-${item.key}`}
                        cx={x}
                        cy={y}
                        r={5}
                        fill="rgb(98, 47, 136)"
                        stroke="white"
                        strokeWidth="2"
                    >
                        <title>{`${item.label}${item.parentCategory ? ` (${item.parentCategory})` : ''}: ${item.scorePct.toFixed(1)}% avg, ${item.strongCoveragePct.toFixed(1)}% strong coverage`}</title>
                    </circle>
                );
            })}
        </svg>
    );
};
