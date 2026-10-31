import { Link } from 'react-router-dom';
import { getVehicleImageSrc } from '../utils/vehicleImage';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function VehicleCard({ vehicle }) {
  if (!vehicle) return null;

  return (
    <article className="vehicle-card">
      <img src={getVehicleImageSrc(vehicle.image)} alt={vehicle.name} className="vehicle-image" />
      <div className="vehicle-card-body">
        <div className="vehicle-card-topline">
          <span className="badge">{vehicle.category}</span>
          <span className={`status ${vehicle.status.toLowerCase()}`}>{vehicle.status}</span>
        </div>

        <h3>{vehicle.name}</h3>
        <p className="vehicle-meta">
          {vehicle.brand} · {vehicle.model} · {vehicle.year}
        </p>

        <div className="vehicle-tags">
          <span>{vehicle.transmission}</span>
          <span>{vehicle.fuelType}</span>
          <span>{vehicle.seatingCapacity} seats</span>
        </div>

        <div className="vehicle-price-row">
          <strong>{formatCurrency(vehicle.dailyRate)}</strong>
          <span>/ day</span>
        </div>

        <div className="card-actions">
          <Link to={`/vehicles/${vehicle.id}`} className="secondary-link">
            View details
          </Link>
          <Link to={`/booking?vehicleId=${encodeURIComponent(vehicle.id)}`} state={{ vehicle }} className="primary-button small">
            Book now
          </Link>
        </div>
      </div>
    </article>
  );
}
