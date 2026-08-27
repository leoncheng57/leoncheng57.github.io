import type { HedwigTool } from './tools'

export type SimulationScope = 'catalog' | 'single'

export interface HedwigSimulationState {
  toolIndex: number
  eventIndex: number
  completed: boolean
  steered: boolean
}

export function createSimulationState(toolIndex = 0): HedwigSimulationState {
  return { toolIndex, eventIndex: 0, completed: false, steered: false }
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
    steered: false,
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
    return { toolIndex: state.toolIndex + 1, eventIndex: 0, completed: false, steered: state.steered }
  }
  return { ...state, completed: true }
}

export function selectTool(toolIndex: number): HedwigSimulationState {
  return createSimulationState(toolIndex)
}

/**
 * Moves one scripted stage within the currently selected tool.
 *
 * Compact embeds use this so their arrows walk that single tool's stages
 * instead of jumping to a neighbouring tool. Manual stepping marks the state
 * as steered, which stops autoplay from overriding the reader's position.
 */
export function stepEvent(
  tools: readonly HedwigTool[],
  state: HedwigSimulationState,
  delta: number
): HedwigSimulationState {
  const lastEventIndex = tools[state.toolIndex].events.length - 1
  const eventIndex = Math.min(lastEventIndex, Math.max(0, state.eventIndex + delta))
  if (eventIndex === state.eventIndex && state.steered) return state
  return { ...state, eventIndex, completed: eventIndex === lastEventIndex, steered: true }
}

export function stepSimulation(
  tools: readonly HedwigTool[],
  state: HedwigSimulationState,
  scope: SimulationScope,
  delta: number
): HedwigSimulationState {
  if (scope === 'single') return stepEvent(tools, state, delta)

  const lastEventIndex = tools[state.toolIndex].events.length - 1
  if (delta > 0) {
    if (state.eventIndex < lastEventIndex) {
      return { ...state, eventIndex: state.eventIndex + 1, completed: false, steered: true }
    }
    if (state.toolIndex < tools.length - 1) {
      return { toolIndex: state.toolIndex + 1, eventIndex: 0, completed: false, steered: true }
    }
    return { ...state, completed: true, steered: true }
  }

  if (state.eventIndex > 0) {
    return { ...state, eventIndex: state.eventIndex - 1, completed: false, steered: true }
  }
  if (state.toolIndex > 0) {
    const toolIndex = state.toolIndex - 1
    return {
      toolIndex,
      eventIndex: tools[toolIndex].events.length - 1,
      completed: false,
      steered: true,
    }
  }
  return { ...state, completed: false, steered: true }
}

export function getEventBounds(
  tools: readonly HedwigTool[],
  state: HedwigSimulationState
): { atFirst: boolean; atLast: boolean } {
  return {
    atFirst: state.eventIndex === 0,
    atLast: state.eventIndex === tools[state.toolIndex].events.length - 1,
  }
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
