import { Link, useLocation, useNavigate } from 'react-router-dom';

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('vehicle-rental-user') || 'null');
  } catch {
    localStorage.removeItem('vehicle-rental-user');
    return null;
  }
}

export default function Navbar() {
  const navigate = useNavigate();
  useLocation();
  const user = getStoredUser();

  const handleLogout = () => {
    localStorage.removeItem('vehicle-rental-token');
    localStorage.removeItem('vehicle-rental-user');
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div className="brand-wrap">
        <Link to="/" className="brand">
          FleetRide
        </Link>
        <span className="brand-subtitle">Premium vehicle rentals</span>
      </div>

      <nav className="main-nav" aria-label="Main navigation">
        <Link to="/">Home</Link>
        <Link to="/vehicles">Vehicles</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/admin">Admin</Link>
      </nav>

      <div className="nav-actions">
        {user ? (
          <>
            <span className="user-pill">{user.name}</span>
            <button type="button" className="primary-button small" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="secondary-link">
              Login
            </Link>
            <Link to="/register" className="primary-button small">
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
