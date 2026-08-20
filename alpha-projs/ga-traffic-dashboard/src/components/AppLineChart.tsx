import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { colorForGroup } from '../appGroups'
import type { ChartRow } from '../charts'

const AXIS = { fontSize: 11, fontFamily: 'ui-monospace, Menlo, monospace' }

// These charts render outside of `dashboard.module.css`'s scope (recharts
// injects inline SVG/tooltip content), so the current theme's colors are
// threaded in as props rather than read from CSS variables.
type ThemeColors = {
  textPrimary: string
  surface: string
  markerColor: string
}

const DEFAULT_THEME_COLORS: ThemeColors = {
  textPrimary: '#10233d',
  surface: '#f5f8f7',
  markerColor: '#087da8',
}

function tooltipStyle(colors: ThemeColors) {
  return {
    border: `2px solid ${colors.textPrimary}`,
    borderRadius: 0,
    background: colors.surface,
    fontSize: '0.78rem',
    fontFamily: 'ui-monospace, Menlo, monospace',
  }
}

type LineProps = {
  data: ChartRow[]
  groupNames: string[]
  hidden: Set<string>
  height?: number
  /** The scrubber's currently selected date/label, shared across all graphs. */
  selectedDate?: string
  themeColors?: ThemeColors
}

export function AppLines({
  data,
  groupNames,
  hidden,
  height = 340,
  selectedDate,
  themeColors = DEFAULT_THEME_COLORS,
}: LineProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,35,61,0.25)" />
        <XAxis dataKey="date" tick={AXIS} stroke={themeColors.textPrimary} />
        <YAxis tick={AXIS} stroke={themeColors.textPrimary} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle(themeColors)} />
        <Legend wrapperStyle={{ fontSize: '0.78rem' }} />
        {selectedDate && (
          <ReferenceLine
            x={selectedDate}
            stroke={themeColors.markerColor}
            strokeWidth={2}
            ifOverflow="extendDomain"
          />
        )}
        {groupNames
          .filter((name) => !hidden.has(name))
          .map((name) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={colorForGroup(name)}
              strokeWidth={2}
              dot={{ r: 2.5, strokeWidth: 0, fill: colorForGroup(name) }}
              connectNulls
              isAnimationActive={false}
            />
          ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

type AreaProps = {
  data: ChartRow[]
  groupNames: string[]
  hidden: Set<string>
  selectedDate?: string
  themeColors?: ThemeColors
}

export function AppShareArea({
  data,
  groupNames,
  hidden,
  selectedDate,
  themeColors = DEFAULT_THEME_COLORS,
}: AreaProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,35,61,0.25)" />
        <XAxis dataKey="date" tick={AXIS} stroke={themeColors.textPrimary} />
        <YAxis
          tick={AXIS}
          stroke={themeColors.textPrimary}
          domain={[0, 100]}
          tickFormatter={(value: number) => `${value}%`}
        />
        <Tooltip
          contentStyle={tooltipStyle(themeColors)}
          formatter={(value: number) => `${value.toFixed(1)}%`}
        />
        <Legend wrapperStyle={{ fontSize: '0.78rem' }} />
        {selectedDate && (
          <ReferenceLine
            x={selectedDate}
            stroke={themeColors.markerColor}
            strokeWidth={2}
            ifOverflow="extendDomain"
          />
        )}
        {groupNames
          .filter((name) => !hidden.has(name))
          .map((name) => (
            <Area
              key={name}
              type="monotone"
              dataKey={name}
              stackId="share"
              stroke={colorForGroup(name)}
              fill={colorForGroup(name)}
              fillOpacity={0.75}
              isAnimationActive={false}
            />
          ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}
