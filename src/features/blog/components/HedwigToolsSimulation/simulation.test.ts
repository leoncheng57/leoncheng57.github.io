import { describe, expect, it } from 'vitest'
import { HEDWIG_TOOLS } from './tools'
import { advanceSimulation, completeSimulation, createSimulationState, getSimulationProgress } from './simulation'

describe('Hedwig simulation engine', () => {
  it('deterministically advances through every event and then stops', () => {
    let state = createSimulationState()
    for (let index = 0; index < 100 && !state.completed; index += 1) {
      state = advanceSimulation(HEDWIG_TOOLS, state, 'catalog')
    }
    expect(state).toEqual(completeSimulation(HEDWIG_TOOLS, 'catalog'))
    expect(advanceSimulation(HEDWIG_TOOLS, state, 'catalog')).toBe(state)
  })

  it('keeps compact progression inside its selected tool', () => {
    let state = createSimulationState(2)
    state = advanceSimulation(HEDWIG_TOOLS, state, 'single')
    state = advanceSimulation(HEDWIG_TOOLS, state, 'single')
    state = advanceSimulation(HEDWIG_TOOLS, state, 'single')
    expect(state.toolIndex).toBe(2)
    expect(state.completed).toBe(true)
    expect(getSimulationProgress(HEDWIG_TOOLS, state, 'single').percent).toBe(100)
  })
})
