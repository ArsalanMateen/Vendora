export default function LoadingSpinner({
  label = "Loading",
  className = "",
}) {
  return (
    <div
      className={`loading-indicator ${className}`.trim()}
      role="status"
      aria-label={label}
    >
      <span className="loading-spinner" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
