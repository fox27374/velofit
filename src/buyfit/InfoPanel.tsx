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
 * - Opens on hover (only on devices with hover: hover)
 * - Opens on click and stays open
 * - Closes on click/tap outside, Esc, pointer leave (if hover opened it)
 * - Real <button> with aria-expanded and aria-label
 * - Tab-reachable, toggled with Enter/Space
 * - Panel stays inside viewport at 360px width
 */
export function InfoPanel({ ariaLabel, note, evidence, anchor }: InfoPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openedByHover, setOpenedByHover] = useState(false);
  const [hasHover, setHasHover] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const researchUrl = anchor
    ? `https://github.com/fox27374/velofit/blob/main/doc/frame-sizing-research.md#${anchor}`
    : '#';

  // Check if device supports hover
  useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: hover)');
    setHasHover(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setHasHover(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // Close on Escape
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setOpenedByHover(false);
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
        setOpenedByHover(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  const handleClick = () => {
    // Click always opens and keeps open
    setIsOpen(true);
    setOpenedByHover(false);
  };

  const handleMouseEnter = () => {
    if (hasHover) {
      setIsOpen(true);
      setOpenedByHover(true);
    }
  };

  const handleMouseLeave = () => {
    // Only close on mouse leave if hover opened it
    if (openedByHover && hasHover) {
      setIsOpen(false);
      setOpenedByHover(false);
    }
  };

  return (
    <div className="info-panel-container">
      <button
        ref={buttonRef}
        className="info-panel-button"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        type="button"
      >
        ⓘ
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          className="info-panel"
          role="tooltip"
          onMouseEnter={() => {
            if (hasHover) {
              setIsOpen(true);
            }
          }}
          onMouseLeave={handleMouseLeave}
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
