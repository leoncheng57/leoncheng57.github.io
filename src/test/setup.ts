import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// jsdom does not implement scrollIntoView; the exercise library uses it for
// pattern deep links.
if (!window.HTMLElement.prototype.scrollIntoView) {
  window.HTMLElement.prototype.scrollIntoView = () => {}
}

window.scrollTo = () => {}

// jsdom does not implement IntersectionObserver; framer-motion's whileInView
// needs it. Observed elements are reported as immediately in view so entrance
// animations settle to their final state in tests.
if (typeof window.IntersectionObserver === 'undefined') {
  class ImmediateIntersectionObserver implements IntersectionObserver {
    readonly root = null
    readonly rootMargin = ''
    readonly thresholds: readonly number[] = []
    constructor(private readonly callback: IntersectionObserverCallback) {}
    observe(target: Element): void {
      this.callback(
        [{ isIntersecting: true, target } as IntersectionObserverEntry],
        this
      )
    }
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return []
    }
  }
  window.IntersectionObserver =
    ImmediateIntersectionObserver as unknown as typeof IntersectionObserver
  globalThis.IntersectionObserver = window.IntersectionObserver
}

afterEach(() => {
  cleanup()
})
