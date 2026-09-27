import { useState, useRef, useEffect } from 'preact/hooks';

interface InfoPanelProps {
  /** The label for the button's aria-label, e.g., "About saddle height" */
  ariaLabel: string;
  /** The note text to display in the panel */
  note: string;
  /** Evidence level: "Sourced", "Weak", or "No source" */
  evidence: 'Sourced' | 'Weak' | 'No source';
  /** URL anchor to the research doc for this item */
  anchor?: string;
}

/**
 * Reusable info panel component: ⓘ button that opens a panel with sourcing info.
 *
 * - Opens on hover and click/tap
 * - Closes on click/tap outside, Esc, pointer leave (hover-capable devices)
 * - Real <button> with aria-expanded and aria-label
 * - Tab-reachable, toggled with Enter/Space
 * - Panel stays inside viewport at 360px width
 */
export function InfoPanel({ ariaLabel, note, evidence, anchor }: InfoPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const researchUrl = anchor
    ? `https://github.com/fox27374/velofit/blob/main/doc/frame-sizing-research.md#${anchor}`
    : '#';

  useEffect(() => {
    if (!isOpen) return;

    // Close on Escape
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    // Close on click outside
    const handleClickOutside = (e: Event) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="info-panel-container">
      <button
        ref={buttonRef}
        className="info-panel-button"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        type="button"
      >
        ⓘ
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          className="info-panel"
          role="tooltip"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <p className="info-panel-note">{note}</p>
          <div className="info-panel-evidence">
            Evidence: <strong>{evidence}</strong>
            {anchor && (
              <>
                {' '}
                ·{' '}
                <a
                  href={researchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="info-panel-link"
                >
                  read the research →
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
