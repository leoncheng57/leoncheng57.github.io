import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// jsdom does not implement scrollIntoView; the exercise library uses it for
// pattern deep links.
if (!window.HTMLElement.prototype.scrollIntoView) {
  window.HTMLElement.prototype.scrollIntoView = () => {}
}

window.scrollTo = () => {}

afterEach(() => {
  cleanup()
})
