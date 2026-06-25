# Computations And Numbers Reference

This document explains the core formulas, thresholds, and numeric constants used by the skills matrix app.

## 1) Proficiency Scale (Canonical)

The app uses a 6-level ordered proficiency scale.

| Level | Weight |
|---|---:|
| N/A | 1 |
| Potential | 2 |
| Exposure | 3 |
| Experience | 4 |
| Expert | 5 |
| Consulting | 6 |

Used in:
- `src/components/index/MatrixSearch.tsx`
- `src/components/heatmap/radarMetrics.ts`

Dataverse choice IDs (UI <-> Dataverse mapping):

| Level | Dataverse Integer |
|---|---:|
| N/A | 894790000 |
| Potential | 894790001 |
| Exposure | 894790002 |
| Experience | 894790003 |
| Expert | 894790004 |
| Consulting | 894790005 |

Used in:
- `src/components/colleagueprofile/SkillsMatrix.tsx`
- `src/types/skills.ts`

## 2) Match Score (Search Results)

For each selected skill/component, a colleague receives a per-skill score in `[0, 100]`. Final match score is the average across selected skills.

`targetWeight = (minLevel === 0) ? 2 : minLevel`

If no selected components:
- score = `100`

If `minLevel === 0` ("Any"):
- per-skill score = `100` if user weight `> 1`, else `0`

If `minLevel > 0` and exact match mode:
- per-skill score = `100` if `userWeight === targetWeight`, else `0`

If `minLevel > 0` and smart match mode:
- `0` if `userWeight === 1` (N/A)
- `100` if `userWeight >= targetWeight`
- otherwise partial credit:

$$
\text{partial} = \frac{(\text{userWeight} - 1)}{(\text{targetWeight} - 1)} \times 100
$$

Final score:

$$
\text{matchScore} = \frac{\sum \text{perSkillScore}}{\text{selectedComponents.length}}
$$

Used in:
- `src/components/index/MatrixSearch.tsx`

## 3) Filtering And Ranking Rules

When selected components exist:
- Rows with `matchScore === 0` are excluded.
- In exact mode, rows with `matchScore < 99.99` are excluded.

When no selected components and `minLevel > 0`:
- Include colleague if they have at least one skill in current view meeting the level rule:
  - exact: `weight === minLevel`
  - smart: `weight >= minLevel`

Sort order:
1. `matchScore` descending
2. name ascending (alphabetical)

Used in:
- `src/components/index/MatrixSearch.tsx`

## 4) Team Gap Analysis

Target definition:
- `targetWeight = (minLevel === 0) ? 2 : minLevel`
- For display, minLevel 0 is shown as "Any Experience".

For each skill and each present team role:
- `maxWeight` = max proficiency weight among members of that role for the skill
- `experts` = members where weight `>= 5` (Expert or Consulting)
- Role gap condition:

$$
\text{hasGap} = \text{isTargeted} \wedge (\text{maxWeight} < \text{targetWeight} \lor \text{maxWeight} = 1)
$$

Overall skill gap across roles:

$$
\text{overallMaxWeight} = \max(\text{roleBreakdown.maxWeight}, 0)
$$

$$
\text{overallGap} = \text{isTargeted} \wedge (\text{overallMaxWeight} < \text{targetWeight} \lor \text{overallMaxWeight} = 1)
$$

Used in:
- `src/components/index/MatrixSearch.tsx`

## 5) Radar / Heatmap Metrics

Per dimension (category or single skill in granular mode):
- Sum all weights across all colleagues x all skills in dimension
- Compute average weight:

$$
\text{avgWeight} = \begin{cases}
\frac{\text{totalScore}}{\text{totalItems}}, & \text{if totalItems} > 0 \\
1, & \text{otherwise}
\end{cases}
$$

- Normalize to percentage where N/A (1) maps to 0% and Consulting (6) maps to 100%:

$$
\text{scorePct} = \left(\frac{\text{avgWeight} - 1}{5}\right) \times 100
$$

- Strong coverage threshold is Experience+ (`weight >= 4`):

$$
\text{strongCoveragePct} = \begin{cases}
\frac{\text{strongCoverageCount}}{\text{totalItems}} \times 100, & \text{if totalItems} > 0 \\
0, & \text{otherwise}
\end{cases}
$$

- Both percentages are clamped to `[0, 100]`.

Weakest dimensions shown:
- sort by `scorePct` ascending
- take first `4`

Granular mode trigger:
- if selected category count `<= 2`, chart dimension switches from category-level to skill-level.

Used in:
- `src/components/heatmap/radarMetrics.ts`
- `src/components/heatmap/TeamRadarChart.tsx`
- `src/components/heatmap/TopGapsPanel.tsx`

## 6) Profile Completion Metrics

On colleague profile page:
- Flatten all skills in current data set
- `accessedCount` = number of skills with any rating present

Completion percentage:

$$
\text{percentage} = \text{round}\left(\frac{\text{accessedCount}}{\text{allSkills.length}} \times 100\right)
$$

Pending skills:

$$
\text{pendingCount} = \text{allSkills.length} - \text{accessedCount}
$$

Used in:
- `src/components/colleagueprofile/SkillsMatrix.tsx`

## 7) UI Thresholds (Interpretation Numbers)

Match score color bands:
- Green: `>= 99.99`
- Amber: `>= 50` and `< 99.99`
- Red: `< 50`

Gap modal role bar segment coloring (based on role `maxWeight`):
- Green: `>= 4`
- Purple: `>= 2` and `< 4`
- Amber: `< 2`

Gap modal role text highlighting:
- Green text when `maxWeight >= 4`
- Red text when `maxWeight === 0` or `maxWeight === 1`

Slider bounds for required level:
- min `0`, max `6`, step `1`

Used in:
- `src/components/index/MatrixSearch.tsx`
- `src/components/index/GapAnalysisModal.tsx`
- `src/components/index/MatrixRequirementsSection.tsx`

## 8) Data Loading / Limit Constants

Dataverse load caps used to reduce pagination issues:
- Skills: `top: 5000`
- Profiles: `top: 5000`
- Assessments: `maxPageSize: 5000`

Used in:
- `src/components/index/MatrixSearch.tsx`
