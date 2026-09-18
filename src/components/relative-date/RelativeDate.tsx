import { useEffect, useState } from 'react'

export function relativeDayLabel(date: string, today = new Date()): string {
  const [year, month, day] = date.split('-').map(Number)
  const currentDay = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  const days = Math.round((currentDay - Date.UTC(year, month - 1, day)) / 86400000)
  if (days === 0) return 'Today'
  if (days < 0) return `In ${-days} ${days === -1 ? 'day' : 'days'}`
  return `${days} ${days === 1 ? 'day' : 'days'} ago`
}

export default function RelativeDate({ date }: { date: string }) {
  const [today, setToday] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setToday(new Date()), 60_000)
    return () => window.clearInterval(timer)
  }, [])
  return <time dateTime={date} title={date}>{relativeDayLabel(date, today)}</time>
}
