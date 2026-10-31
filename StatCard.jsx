export default function StatCard({ label, value, helper }) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <strong>{value}</strong>
      <small>{helper}</small>
    </div>
  );
}
