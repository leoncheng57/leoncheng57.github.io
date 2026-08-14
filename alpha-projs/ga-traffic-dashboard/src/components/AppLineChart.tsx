import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { colorForGroup } from '../appGroups'
import type { ChartRow } from '../charts'

const AXIS = { fontSize: 11, fontFamily: 'ui-monospace, Menlo, monospace' }
const TOOLTIP_STYLE = {
  border: '2px solid #10233d',
  borderRadius: 0,
  background: '#f5f8f7',
  fontSize: '0.78rem',
  fontFamily: 'ui-monospace, Menlo, monospace',
}

type LineProps = {
  data: ChartRow[]
  groupNames: string[]
  hidden: Set<string>
  height?: number
}

export function AppLines({ data, groupNames, hidden, height = 340 }: LineProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,35,61,0.25)" />
        <XAxis dataKey="date" tick={AXIS} stroke="#10233d" />
        <YAxis tick={AXIS} stroke="#10233d" allowDecimals={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend wrapperStyle={{ fontSize: '0.78rem' }} />
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
}

export function AppShareArea({ data, groupNames, hidden }: AreaProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,35,61,0.25)" />
        <XAxis dataKey="date" tick={AXIS} stroke="#10233d" />
        <YAxis
          tick={AXIS}
          stroke="#10233d"
          domain={[0, 100]}
          tickFormatter={(value: number) => `${value}%`}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(value: number) => `${value.toFixed(1)}%`}
        />
        <Legend wrapperStyle={{ fontSize: '0.78rem' }} />
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
