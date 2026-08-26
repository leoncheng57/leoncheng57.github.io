import { useEffect, useId, useState } from 'react'
import type { ReactElement } from 'react'
import styles from './MermaidDiagram.module.css'

interface MermaidDiagramProps {
  source: string
  title: string
}

type RenderState =
  | { status: 'loading' }
  | { status: 'ready'; svg: string }
  | { status: 'error' }

let mermaidInitialized = false

function sanitizeSvg(svg: string, title: string): string | null {
  const document = new DOMParser().parseFromString(svg, 'image/svg+xml')
  const root = document.documentElement

  if (root.localName !== 'svg' || document.querySelector('parsererror')) {
    return null
  }

  document
    .querySelectorAll('script, foreignObject, iframe, object, embed, image, audio, video, link')
    .forEach((element) => element.remove())
  document.querySelectorAll('*').forEach((element) => {
    for (const attribute of Array.from(element.attributes)) {
      const value = attribute.value.trim().toLowerCase()
      if (
        attribute.name.toLowerCase().startsWith('on') ||
        ((attribute.localName === 'href' || attribute.localName === 'src') &&
          value !== '' &&
          !value.startsWith('#'))
      ) {
        element.removeAttribute(attribute.name)
      }
    }
  })

  root.setAttribute('role', 'img')
  root.setAttribute('aria-label', title)
  root.removeAttribute('aria-roledescription')
  root.querySelector(':scope > title')?.remove()

  const titleElement = document.createElementNS('http://www.w3.org/2000/svg', 'title')
  titleElement.textContent = title
  root.insertBefore(titleElement, root.firstChild)

  return new XMLSerializer().serializeToString(root)
}

export default function MermaidDiagram({ source, title }: MermaidDiagramProps): ReactElement {
  const reactId = useId()
  const diagramId = `mermaid-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`
  const [renderState, setRenderState] = useState<RenderState>({ status: 'loading' })
  const [isZoomed, setIsZoomed] = useState(false)

  useEffect(() => {
    let active = true
    setRenderState({ status: 'loading' })

    async function renderDiagram(): Promise<void> {
      try {
        const { default: mermaid } = await import('mermaid')
        if (!mermaidInitialized) {
          mermaid.initialize({
            startOnLoad: false,
            securityLevel: 'strict',
            suppressErrorRendering: true,
            theme: 'base',
            look: 'classic',
            htmlLabels: false,
            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
            themeVariables: {
              background: '#f7f8f5',
              primaryColor: '#e6eee8',
              primaryTextColor: '#1f2923',
              primaryBorderColor: '#607568',
              lineColor: '#647169',
              secondaryColor: '#f0f2ef',
              tertiaryColor: '#ffffff',
              clusterBkg: '#f4f5f2',
              clusterBorder: '#9aa59e',
              edgeLabelBackground: '#f7f8f5',
            },
            // Mermaid accepts this in browsers that support animated diagrams;
            // CSS below also disables motion for generated SVG elements.
            reducedMotion: true,
          } as Parameters<typeof mermaid.initialize>[0] & { reducedMotion: boolean })
          mermaidInitialized = true
        }

        const result = await mermaid.render(diagramId, source)
        const safeSvg = sanitizeSvg(result.svg, title)
        if (!safeSvg) {
          throw new Error('Mermaid did not return a valid SVG')
        }

        if (active) {
          setRenderState({ status: 'ready', svg: safeSvg })
        }
      } catch {
        if (active) {
          setRenderState({ status: 'error' })
        }
      }
    }

    void renderDiagram()
    return () => {
      active = false
    }
  }, [diagramId, source, title])

  useEffect(() => {
    if (!isZoomed) return undefined

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsZoomed(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isZoomed])

  const zoomedSvgSrc = renderState.status === 'ready'
    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(renderState.svg)}`
    : ''

  return (
    <>
      <figure className={styles.figure}>
        {renderState.status === 'ready' ? (
          <button
            type="button"
            className={styles.zoomButton}
            aria-label={`Zoom diagram: ${title}`}
            title="Open zoomed diagram"
            onClick={() => setIsZoomed(true)}
          >
            <span
              className={styles.diagram}
              // Mermaid generated this SVG under strict mode, and sanitizeSvg removes
              // executable content before it reaches the DOM.
              dangerouslySetInnerHTML={{ __html: renderState.svg }}
            />
          </button>
        ) : (
          <div className={styles.fallback} role={renderState.status === 'error' ? 'alert' : 'status'}>
            <strong>
              {renderState.status === 'error' ? 'Diagram could not be rendered.' : 'Rendering diagram...'}
            </strong>
            <pre>
              <code>{source}</code>
            </pre>
          </div>
        )}
        <figcaption className={styles.caption}>{title}</figcaption>
      </figure>

      {isZoomed ? (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-label={`Zoomed diagram: ${title}`}
          onClick={() => setIsZoomed(false)}
        >
          <div className={styles.overlayInner} onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className={styles.close}
              aria-label="Close diagram zoom"
              autoFocus
              onClick={() => setIsZoomed(false)}
            >
              Close
            </button>
            <img src={zoomedSvgSrc} alt={title} className={styles.zoomedDiagram} />
          </div>
        </div>
      ) : null}
    </>
  )
}
