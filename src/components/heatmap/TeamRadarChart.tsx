import { useMemo, useState } from 'react';
import type { RadarDimension } from './types';

const PLOT_SIZE = 520;
const CHART_PADDING = 130;
const SIZE = PLOT_SIZE + (CHART_PADDING * 2);
const CENTER_X = CHART_PADDING + (PLOT_SIZE / 2);
const CENTER_Y = CHART_PADDING + (PLOT_SIZE / 2) - 56;
const RADIUS = 190;
const RINGS = [20, 40, 60, 80, 100];
const TOOLTIP_WIDTH = 292;
const TOOLTIP_HEIGHT = 146;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const TeamRadarChart = ({ dimensions }: { dimensions: RadarDimension[] }) => {
    const angleStep = (Math.PI * 2) / dimensions.length;

    const [hoveredKey, setHoveredKey] = useState<string | null>(null);

    const plottedPoints = useMemo(
        () => dimensions.map((item, index) => {
            const angle = -Math.PI / 2 + index * angleStep;
            const scaledRadius = (item.scorePct / 100) * RADIUS;
            const x = CENTER_X + Math.cos(angle) * scaledRadius;
            const y = CENTER_Y + Math.sin(angle) * scaledRadius;
            return { item, x, y };
        }),
        [dimensions, angleStep]
    );

    const radarPoints = plottedPoints.map(({ x, y }) => `${x},${y}`).join(' ');
    const hoveredPoint = hoveredKey ? plottedPoints.find(({ item }) => item.key === hoveredKey) : undefined;

    return (
        <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="w-full max-w-175 h-auto"
            role="img"
            aria-label="Team category radar chart"
            onMouseLeave={() => setHoveredKey(null)}
        >
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

            {plottedPoints.map(({ item, x, y }) => {
                const isHovered = hoveredKey === item.key;

                return (
                    <circle
                        key={`point-${item.key}`}
                        cx={x}
                        cy={y}
                        r={isHovered ? 7 : 5}
                        fill={isHovered ? 'rgb(76, 29, 149)' : 'rgb(98, 47, 136)'}
                        stroke="white"
                        strokeWidth="2"
                        className="cursor-pointer transition-all"
                        onMouseEnter={() => setHoveredKey(item.key)}
                    />
                );
            })}

            {hoveredPoint && (() => {
                const tooltipX = clamp(hoveredPoint.x + 12, 8, SIZE - TOOLTIP_WIDTH - 8);
                const tooltipY = clamp(hoveredPoint.y - TOOLTIP_HEIGHT - 12, 8, SIZE - TOOLTIP_HEIGHT - 8);

                return (
                    <g pointerEvents="none" transform={`translate(${tooltipX}, ${tooltipY})`}>
                        <rect width={TOOLTIP_WIDTH} height={TOOLTIP_HEIGHT} rx={10} fill="rgba(15, 23, 42, 0.95)" />
                        <rect x={1} y={1} width={TOOLTIP_WIDTH - 2} height={TOOLTIP_HEIGHT - 2} rx={9} fill="none" stroke="rgba(167, 139, 250, 0.55)" />

                        <text x={14} y={24} className="fill-white text-[13px] font-bold">
                            {hoveredPoint.item.parentCategory
                                ? `${hoveredPoint.item.label} (${hoveredPoint.item.parentCategory})`
                                : hoveredPoint.item.label}
                        </text>

                        <text x={14} y={48} className="fill-violet-200 text-[12px] font-semibold">
                            Avg: {hoveredPoint.item.scorePct.toFixed(1)}% | Strong: {hoveredPoint.item.strongCoveragePct.toFixed(1)}%
                        </text>

                        <text x={14} y={74} className="fill-slate-200 text-[11px] font-medium">
                            Needs Support (N/A + Potential + Exposure): {hoveredPoint.item.needsSupportCount}
                        </text>
                        <text x={14} y={94} className="fill-slate-200 text-[11px] font-medium">
                            Independent (Experience): {hoveredPoint.item.independentCount}
                        </text>
                        <text x={14} y={114} className="fill-slate-200 text-[11px] font-medium">
                            Mentor Ready (Expert + Consulting): {hoveredPoint.item.mentorReadyCount}
                        </text>
                        <text x={14} y={132} className="fill-slate-400 text-[10px] font-medium">
                            Total colleagues: {hoveredPoint.item.totalColleagues}
                        </text>
                    </g>
                );
            })()}
        </svg>
    );
};
