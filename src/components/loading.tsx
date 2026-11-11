/** Quiet spinner with a label, used while a screen loads its data. */
export function Loading({ label = "Loading" }: { label?: string }) {
  return (
    <div className="loading" role="status">
      <i aria-hidden />
      {label}…
    </div>
  );
}
