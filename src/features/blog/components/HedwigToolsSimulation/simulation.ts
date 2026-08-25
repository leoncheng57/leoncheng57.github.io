import type { HedwigTool } from './tools'

export type SimulationScope = 'catalog' | 'single'

export interface HedwigSimulationState {
  toolIndex: number
  eventIndex: number
  completed: boolean
}

export function createSimulationState(toolIndex = 0): HedwigSimulationState {
  return { toolIndex, eventIndex: 0, completed: false }
}

export function completeSimulation(
  tools: readonly HedwigTool[],
  scope: SimulationScope,
  toolIndex = 0
): HedwigSimulationState {
  const finalToolIndex = scope === 'catalog' ? tools.length - 1 : toolIndex
  return {
    toolIndex: finalToolIndex,
    eventIndex: tools[finalToolIndex].events.length - 1,
    completed: true,
  }
}

export function advanceSimulation(
  tools: readonly HedwigTool[],
  state: HedwigSimulationState,
  scope: SimulationScope
): HedwigSimulationState {
  if (state.completed) return state
  const eventCount = tools[state.toolIndex].events.length
  if (state.eventIndex < eventCount - 1) return { ...state, eventIndex: state.eventIndex + 1 }
  if (scope === 'catalog' && state.toolIndex < tools.length - 1) {
    return { toolIndex: state.toolIndex + 1, eventIndex: 0, completed: false }
  }
  return { ...state, completed: true }
}

export function selectTool(toolIndex: number): HedwigSimulationState {
  return createSimulationState(toolIndex)
}

export function getSimulationProgress(
  tools: readonly HedwigTool[],
  state: HedwigSimulationState,
  scope: SimulationScope
): { current: number; total: number; percent: number } {
  if (scope === 'single') {
    const total = tools[state.toolIndex].events.length
    const current = state.completed ? total : state.eventIndex + 1
    return { current, total, percent: (current / total) * 100 }
  }
  const prior = tools.slice(0, state.toolIndex).reduce((sum, tool) => sum + tool.events.length, 0)
  const total = tools.reduce((sum, tool) => sum + tool.events.length, 0)
  const current = state.completed ? total : prior + state.eventIndex + 1
  return { current, total, percent: (current / total) * 100 }
}

export function summarizeSimulation(
  tools: readonly HedwigTool[],
  state: HedwigSimulationState
): string {
  const tool = tools[state.toolIndex]
  const event = tool.events[state.eventIndex]
  return `${tool.title}. ${event.label}. ${event.detail}${state.completed ? ' Simulation complete.' : ''}`
}
