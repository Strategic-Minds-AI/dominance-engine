export default function FunnelField({ label, children }) {
  return (
    <div>
      <span className="block text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-3">{label}</span>
      {children}
    </div>
  );
}