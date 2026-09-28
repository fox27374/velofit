import { useEffect, useRef, useState } from 'preact/hooks'
import type { ComponentChildren } from 'preact'

export type Evidence = 'Sourced' | 'Weak' | 'No source'

const RESEARCH_DOC = 'https://github.com/fox27374/velofit/blob/main/doc/frame-sizing-research.md'

/**
 * `hover`: opened by the mouse, closes when the mouse leaves.
 * `pinned`: opened by click, tap or keyboard, stays until closed.
 */
export type InfoState = 'closed' | 'hover' | 'pinned'
export type InfoEvent = 'enter' | 'leave' | 'click' | 'outside' | 'escape'

/**
 * A click on a panel the mouse already opened pins it instead of closing it:
 * a mouse always hovers before it clicks, so toggling there would close the
 * panel the instant the rider asked for it.
 */
export function nextInfoState(state: InfoState, event: InfoEvent, canHover: boolean): InfoState {
  switch (event) {
    case 'enter':
      return canHover && state === 'closed' ? 'hover' : state
    case 'leave':
      return state === 'hover' ? 'closed' : state
    case 'click':
      return state === 'pinned' ? 'closed' : 'pinned'
    case 'outside':
    case 'escape':
      return 'closed'
  }
}

/**
 * The ⓘ next to a number: why the number is what it is, and how well the
 * evidence supports it. Replaces the visible badges; the evidence level is
 * one tap away instead of always on screen.
 */
export function InfoPanel({
  label,
  evidence,
  anchor,
  children,
}: {
  /** What the panel is about, for the button's accessible name: "About <label>". */
  label: string
  evidence: Evidence
  /** Heading anchor in doc/frame-sizing-research.md. */
  anchor: string
  children: ComponentChildren
}) {
  const [state, setState] = useState<InfoState>('closed')
  const root = useRef<HTMLSpanElement>(null)
  const canHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches
  const send = (event: InfoEvent) => setState((s) => nextInfoState(s, event, canHover))

  useEffect(() => {
    if (state === 'closed') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') send('escape')
    }
    const onPointer = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) send('outside')
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [state])

  return (
    <span
      className="info"
      ref={root}
      onMouseEnter={() => send('enter')}
      onMouseLeave={() => send('leave')}
    >
      <button
        type="button"
        className="info-button"
        aria-label={`About ${label}`}
        aria-expanded={state !== 'closed'}
        onClick={() => send('click')}
      >
        ⓘ
      </button>
      {state !== 'closed' && (
        <span className="info-panel" role="note">
          <span className="info-panel-text">{children}</span>
          <span className="info-panel-evidence">
            Evidence: <strong>{evidence}</strong> ·{' '}
            <a href={`${RESEARCH_DOC}#${anchor}`} target="_blank" rel="noopener noreferrer">
              read the research →
            </a>
          </span>
        </span>
      )}
    </span>
  )
}
