import { describe, expect, it } from 'vitest'
import { HEDWIG_TOOLS } from './tools'
import { advanceSimulation, completeSimulation, createSimulationState, getSimulationProgress, stepSimulation } from './simulation'

describe('Hedwig simulation engine', () => {
  it('deterministically advances through every event and then stops', () => {
    let state = createSimulationState()
    for (let index = 0; index < 100 && !state.completed; index += 1) {
      state = advanceSimulation(HEDWIG_TOOLS, state, 'catalog')
    }
    expect(state).toEqual(completeSimulation(HEDWIG_TOOLS, 'catalog'))
    expect(state.toolIndex).toBe(HEDWIG_TOOLS.length - 1)
    const total = HEDWIG_TOOLS.reduce((sum, tool) => sum + tool.events.length, 0)
    expect(getSimulationProgress(HEDWIG_TOOLS, state, 'catalog')).toEqual({
      current: total,
      total,
      percent: 100,
    })
    expect(advanceSimulation(HEDWIG_TOOLS, state, 'catalog')).toBe(state)
  })

  it('keeps compact progression inside its selected tool', () => {
    let state = createSimulationState(2)
    for (let index = 0; index < HEDWIG_TOOLS[2].events.length; index += 1) {
      state = advanceSimulation(HEDWIG_TOOLS, state, 'single')
    }
    expect(state.toolIndex).toBe(2)
    expect(state.completed).toBe(true)
    expect(getSimulationProgress(HEDWIG_TOOLS, state, 'single').percent).toBe(100)
  })

  it('manually steps across catalog tool boundaries in both directions', () => {
    let state = createSimulationState()
    for (let frame = 0; frame < HEDWIG_TOOLS[0].events.length; frame += 1) {
      state = stepSimulation(HEDWIG_TOOLS, state, 'catalog', 1)
    }
    expect(state).toMatchObject({ toolIndex: 1, eventIndex: 0, steered: true })

    state = stepSimulation(HEDWIG_TOOLS, state, 'catalog', -1)
    expect(state).toMatchObject({
      toolIndex: 0,
      eventIndex: HEDWIG_TOOLS[0].events.length - 1,
      steered: true,
    })
  })
})
