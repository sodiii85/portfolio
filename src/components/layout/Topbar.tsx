export function Topbar() {
  return (
    <header className="topbar">
      <div className="segmented" role="group" aria-label="Output medium">
        <button type="button" className="seg is-active" aria-pressed="true">
          2D
        </button>
        <button type="button" className="seg" aria-pressed="false">
          3D
        </button>
        <button type="button" className="seg" aria-pressed="false">
          VR
        </button>
        <button type="button" className="seg" aria-pressed="false">
          AR
        </button>
      </div>

      <div className="start-btn-wrapper">
        <button type="button" className="start-btn">
          Start Designing
          <svg className="start-btn-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z" />
            <path d="m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18" />
            <path d="m2.3 2.3 7.286 7.286" />
            <circle cx="11" cy="11" r="2" />
          </svg>
        </button>
        <span className="start-dot top left" />
        <span className="start-dot top right" />
        <span className="start-dot bottom left" />
        <span className="start-dot bottom right" />
        <span className="start-line horizontal top" />
        <span className="start-line horizontal bottom" />
        <span className="start-line vertical left" />
        <span className="start-line vertical right" />
      </div>

      <div className="topbar__meta">
        <span className="pill pill--stat" aria-label="Cursor speed">
          0 px/s
        </span>
        <button type="button" className="icon-btn" aria-label="Unmute" aria-pressed="true">
          <span aria-hidden="true">🔇</span>
        </button>
        <figure className="slot slot--circle slot--avatar" data-hint="You" />
      </div>
    </header>
  );
}
