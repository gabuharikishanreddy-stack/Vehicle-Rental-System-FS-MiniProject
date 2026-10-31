import { BrowserRouter, Link, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import VehicleCard from './components/VehicleCard';
import StatCard from './components/StatCard';
import { getVehicleImageSrc } from './utils/vehicleImage';
import './App.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const api = axios.create({ baseURL: API_BASE });

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);

const getToken = () => localStorage.getItem('vehicle-rental-token');

const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />
        <main className="page-container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/vehicles" element={<VehiclesPage />} />
            <Route path="/vehicles/:id" element={<VehicleDetailsPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

function NotFoundPage() {
  return (
    <div className="panel empty-state">
      <p className="eyebrow">Page not found</p>
      <h2>This page doesn't exist.</h2>
      <p>Use one of the links below to continue browsing FleetRide.</p>
      <div className="detail-actions">
        <Link to="/" className="primary-button">Go home</Link>
        <Link to="/vehicles" className="secondary-link">Browse vehicles</Link>
      </div>
    </div>
  );
}

function HomePage() {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    api.get('/api/vehicles').then((response) => setVehicles(response.data.vehicles || [])).catch(() => setVehicles([]));
  }, []);

  const highlights = useMemo(
    () => [
      { label: 'Fleet size', value: vehicles.length ? String(vehicles.length) : '—', helper: 'Cars, SUVs, luxury sedans' },
      { label: 'Cities served', value: '15', helper: 'Across India' },
      { label: 'Customer rating', value: '4.8/5', helper: 'Based on 12K+ rides' },
      { label: 'Revenue', value: '₹4.8 Cr', helper: 'This quarter' },
    ],
    [vehicles.length]
  );

  const featuredVehicles = vehicles.slice(0, 3);

  return (
    <>
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">Trusted mobility, smarter booking</p>
          <h1>Drive your next trip with FleetRide.</h1>
          <p className="hero-text">
            Book premium rental vehicles for business travel, family outings, weekend escapes, and everyday mobility with transparent pricing and instant support.
          </p>
          <div className="hero-actions">
            <Link to="/vehicles" className="primary-button">
              Explore vehicles
            </Link>
            <Link to="/register" className="secondary-link large">
              Become a member
            </Link>
          </div>
        </div>

        <div className="hero-card">
          <div className="mini-card">
            <span>Available today</span>
            <strong>{vehicles.length || 12} vehicles</strong>
          </div>
          <div className="mini-card accent">
            <span>Pickup spots</span>
            <strong>18 branches</strong>
          </div>
          <div className="mini-card dark">
            <span>Average price</span>
            <strong>₹2,400/day</strong>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        {highlights.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} helper={stat.helper} />
        ))}
      </section>

      <section className="section-block">
        <div className="section-header">
          <div>
            <p className="eyebrow">Popular picks</p>
            <h2>Featured vehicles</h2>
          </div>
          <Link to="/vehicles" className="secondary-link">
            View all vehicles
          </Link>
        </div>

        <div className="vehicle-grid">
          {featuredVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      </section>

      <section className="section-block feature-grid">
        <div className="feature-card">
          <h3>Instant verification</h3>
          <p>Driver identity, license checks, and account verification in minutes.</p>
        </div>
        <div className="feature-card">
          <h3>Smart pricing</h3>
          <p>Flexible daily rates, taxes, coupons, damage covers, and flexible rental planning.</p>
        </div>
        <div className="feature-card">
          <h3>24/7 support</h3>
          <p>Customer support, booking modifications, and pickup or return assistance anytime.</p>
        </div>
      </section>
    </>
  );
}

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/auth/register', form);
      localStorage.setItem('vehicle-rental-token', response.data.token);
      localStorage.setItem('vehicle-rental-user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (registerError) {
      setError(registerError.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-layout">
      <div className="panel">
        <p className="eyebrow">Create account</p>
        <h2>Register with FleetRide</h2>
        <form onSubmit={onSubmit} className="form-grid">
          <input name="name" placeholder="Full name" autoComplete="name" value={form.name} onChange={onChange} required />
          <input type="email" name="email" placeholder="Email address" autoComplete="email" value={form.email} onChange={onChange} required />
          <input type="password" name="password" placeholder="Password (at least 8 characters)" autoComplete="new-password" minLength="8" value={form.password} onChange={onChange} required />
          <input name="phone" placeholder="Phone number" value={form.phone} onChange={onChange} />
          <textarea name="address" placeholder="Address" rows="3" value={form.address} onChange={onChange} />
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="muted-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </section>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', form);
      localStorage.setItem('vehicle-rental-token', response.data.token);
      localStorage.setItem('vehicle-rental-user', JSON.stringify(response.data.user));
      navigate(location.state?.from || '/dashboard', {
        state: location.state?.vehicle ? { vehicle: location.state.vehicle } : undefined,
      });
    } catch (loginError) {
      setError(loginError.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-layout">
      <div className="panel">
        <p className="eyebrow">Welcome back</p>
        <h2>Login to continue</h2>
        <form onSubmit={onSubmit} className="form-grid">
          <input type="email" name="email" placeholder="Email address" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          <input type="password" name="password" placeholder="Password" autoComplete="current-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="primary-button" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        </form>
        <p className="muted-link">
          New here? <Link to="/register">Create account</Link>
        </p>
      </div>
    </section>
  );
}

function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ search: '', category: '', location: '' });

  useEffect(() => {
    let active = true;
    api.get('/api/vehicles', { params: filters })
      .then((response) => {
        if (active) setVehicles(response.data.vehicles || []);
      })
      .catch(() => {
        if (active) setError('Unable to load vehicles. Please check that the API server is running and try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filters]);

  const handleFilterChange = (event) => {
    setLoading(true);
    setError('');
    setFilters((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  };

  return (
    <section className="section-block">
      <div className="section-header narrow">
        <div>
          <p className="eyebrow">Browse vehicles</p>
          <h2>Find your ideal ride</h2>
        </div>
      </div>

      <div className="filter-bar">
        <input name="search" placeholder="Search vehicle or brand" value={filters.search} onChange={handleFilterChange} />
        <input name="location" placeholder="City or branch" value={filters.location} onChange={handleFilterChange} />
        <input name="category" placeholder="Category" value={filters.category} onChange={handleFilterChange} />
      </div>

      <div className="vehicle-grid">
        {loading && <p role="status">Loading vehicles...</p>}
        {error && <p className="error-text" role="alert">{error}</p>}
        {!loading && !error && vehicles.length === 0 && <p className="empty-state">No vehicles match these filters.</p>}
        {!error && vehicles.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
    </section>
  );
}

function VehicleDetailsPage() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    api.get(`/api/vehicles/${id}`)
      .then((response) => {
        if (active) {
          setVehicle(response.data.vehicle);
          setError(null);
        }
      })
      .catch((requestError) => {
        if (active) {
          setError({
            id,
            message: requestError.response?.data?.message || 'Unable to load vehicle details. Please try again.',
          });
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (error?.id === id) {
    return (
      <div className="panel empty-state">
        <p className="error-text" role="alert">{error.message}</p>
        <Link to="/vehicles" className="primary-button">Back to vehicles</Link>
      </div>
    );
  }

  if (!vehicle || vehicle.id !== id) {
    return <div className="panel empty-state" role="status">Loading vehicle details...</div>;
  }

  return (
    <section className="vehicle-detail-layout">
      <div className="vehicle-hero-image">
        <img src={getVehicleImageSrc(vehicle.image)} alt={vehicle.name} />
      </div>
      <div className="detail-panel panel">
        <p className="eyebrow">{vehicle.category}</p>
        <h2>{vehicle.name}</h2>
        <p className="vehicle-meta">{vehicle.brand} · {vehicle.model} · {vehicle.year}</p>
        <div className="price-box">
          <strong>{formatCurrency(vehicle.dailyRate)}</strong>
          <span>per day</span>
        </div>

        <div className="vehicle-tags">
          <span>{vehicle.transmission}</span>
          <span>{vehicle.fuelType}</span>
          <span>{vehicle.seatingCapacity} seats</span>
          <span>{vehicle.location}</span>
        </div>

        <p>{vehicle.description}</p>

        <div className="feature-list">
          {vehicle.features?.map((feature) => <span key={feature}>{feature}</span>)}
        </div>

        <div className="detail-actions">
          <Link to={`/booking?vehicleId=${encodeURIComponent(vehicle.id)}`} state={{ vehicle }} className="primary-button">
            Reserve this vehicle
          </Link>
          <Link to="/vehicles" className="secondary-link">
            Back to catalog
          </Link>
        </div>
      </div>
    </section>
  );
}

function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const vehicleId = searchParams.get('vehicleId') || location.state?.vehicle?.id || '';
  const [vehicle, setVehicle] = useState(() => location.state?.vehicle || null);
  const [vehicleLoading, setVehicleLoading] = useState(!location.state?.vehicle && Boolean(vehicleId));
  const [vehicleError, setVehicleError] = useState('');
  const [pricing, setPricing] = useState(null);
  const [form, setForm] = useState(() => {
    const pickupDate = new Date();
    const returnDate = new Date(pickupDate);
    returnDate.setDate(returnDate.getDate() + 1);

    return {
      vehicleId,
      pickupDate: pickupDate.toISOString().slice(0, 10),
      returnDate: returnDate.toISOString().slice(0, 10),
      pickupLocation: vehicle?.location || 'Koramangala',
      returnLocation: vehicle?.location || 'Koramangala',
      discount: 0,
    };
  });
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!vehicleId || vehicle?.id === vehicleId) {
      return undefined;
    }

    let active = true;
    api.get(`/api/vehicles/${vehicleId}`)
      .then((response) => {
        if (active) {
          setVehicle(response.data.vehicle);
          setVehicleError('');
          setForm((previous) => ({
            ...previous,
            vehicleId: response.data.vehicle.id,
            pickupLocation: response.data.vehicle.location,
            returnLocation: response.data.vehicle.location,
          }));
        }
      })
      .catch((requestError) => {
        if (active) {
          setVehicleError(requestError.response?.data?.message || 'Unable to load the selected vehicle.');
        }
      })
      .finally(() => {
        if (active) setVehicleLoading(false);
      });

    return () => {
      active = false;
    };
  }, [vehicle, vehicleId]);

  useEffect(() => {
    if (!vehicle || !form.pickupDate || !form.returnDate) return;

    const start = new Date(form.pickupDate);
    const end = new Date(form.returnDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
      return;
    }

    const days = Math.max(1, Math.ceil((end - start) / 86400000) + 1);
    let active = true;

    api.get('/api/pricing', {
      params: { dailyRate: vehicle.dailyRate, days, discount: form.discount || 0 },
    })
      .then((response) => {
        if (active) setPricing(response.data.pricing);
      })
      .catch(() => {
        if (active) {
          setPricing(null);
          setStatus('Unable to calculate pricing. Please try again.');
        }
      });

    return () => {
      active = false;
    };
  }, [vehicle, form.pickupDate, form.returnDate, form.discount]);

  const handleChange = (event) => {
    if (['pickupDate', 'returnDate', 'discount'].includes(event.target.name)) {
      setPricing(null);
    }
    setStatus('');
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!getToken()) {
      navigate('/login', {
        state: {
          from: `${location.pathname}${location.search}`,
          vehicle,
        },
      });
      return;
    }

    if (!form.pickupDate || !form.returnDate || form.returnDate < form.pickupDate) {
      setStatus('Choose a valid return date on or after the pickup date.');
      return;
    }

    setSubmitting(true);
    setStatus('');
    try {
      await api.post('/api/bookings', { ...form, vehicleId: vehicle.id }, { headers: getAuthHeaders() });
      setStatus('Booking created successfully. Redirecting to your dashboard...');
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (error) {
      setStatus(error.response?.data?.message || 'Unable to create booking.');
    } finally {
      setSubmitting(false);
    }
  };

  if (vehicleLoading || (vehicleId && vehicle?.id !== vehicleId && !vehicleError)) {
    return <div className="panel empty-state" role="status">Loading selected vehicle...</div>;
  }

  if (vehicleError) {
    return (
      <div className="panel empty-state">
        <p className="error-text" role="alert">{vehicleError}</p>
        <Link to="/vehicles" className="primary-button">Browse vehicles</Link>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="panel empty-state">
        <p>Select a vehicle to continue booking.</p>
        <Link to="/vehicles" className="primary-button">Browse vehicles</Link>
      </div>
    );
  }

  return (
    <section className="booking-layout">
      <div className="panel info-panel">
        <p className="eyebrow">Booking summary</p>
        <h2>{vehicle.name}</h2>
        <p>{vehicle.brand} · {vehicle.model} · {vehicle.year}</p>
        <div className="booking-summary">
          <span>Daily rate</span>
          <strong>{formatCurrency(vehicle.dailyRate)}</strong>
        </div>
        <div className="booking-summary">
          <span>Pickup</span>
          <strong>{form.pickupLocation}</strong>
        </div>
        <div className="booking-summary">
          <span>Return</span>
          <strong>{form.returnLocation}</strong>
        </div>
        <div className="booking-summary total">
          <span>Estimated total</span>
          <strong>{pricing ? formatCurrency(pricing.total) : 'Calculating...'}</strong>
        </div>
      </div>

      <div className="panel">
        <p className="eyebrow">Reserve now</p>
        <h2>Complete booking</h2>
        <form onSubmit={handleSubmit} className="form-grid">
          <label>Pickup date<input type="date" name="pickupDate" value={form.pickupDate} onChange={handleChange} required /></label>
          <label>Return date<input type="date" name="returnDate" min={form.pickupDate} value={form.returnDate} onChange={handleChange} required /></label>
          <label>Pickup location<input name="pickupLocation" value={form.pickupLocation} onChange={handleChange} required /></label>
          <label>Return location<input name="returnLocation" value={form.returnLocation} onChange={handleChange} required /></label>
          <label>Discount (%)<input type="number" name="discount" min="0" max="50" value={form.discount} onChange={handleChange} /></label>
          {status && <p className={status.startsWith('Booking created') ? 'success-text' : 'error-text'} role="status">{status}</p>}
          <button type="submit" className="primary-button" disabled={submitting || !pricing || form.returnDate < form.pickupDate}>
            {submitting ? 'Confirming...' : 'Confirm booking'}
          </button>
        </form>
      </div>
    </section>
  );
}

function DashboardPage() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('vehicle-rental-user') || 'null');
    } catch {
      return null;
    }
  });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(() => Boolean(getToken()));
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      return;
    }

    let active = true;
    Promise.all([
      api.get('/api/users/profile', { headers: getAuthHeaders() }),
      api.get('/api/bookings', { headers: getAuthHeaders() }),
    ])
      .then(([profileResponse, bookingResponse]) => {
        if (!active) return;
        setUser(profileResponse.data.user);
        localStorage.setItem('vehicle-rental-user', JSON.stringify(profileResponse.data.user));
        setBookings(bookingResponse.data.bookings || []);
        setError('');
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.response?.data?.message || 'Unable to load your dashboard. Please log in again.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (!getToken()) {
    return (
      <div className="panel empty-state">
        <p>Please login to view your customer dashboard.</p>
        <Link to="/login" className="primary-button">Go to login</Link>
      </div>
    );
  }

  if (loading) {
    return <div className="panel empty-state" role="status">Loading your dashboard...</div>;
  }

  if (!user) {
    return (
      <div className="panel empty-state">
        <p className="error-text" role="alert">{error || 'Your session has expired. Please log in again.'}</p>
        <Link to="/login" className="primary-button">Go to login</Link>
      </div>
    );
  }

  return (
    <section className="dashboard-layout">
      <div className="panel summary-panel">
        <p className="eyebrow">Customer dashboard</p>
        <h2>Welcome, {user.name}</h2>
        <p>{user.email}</p>
        <ul className="info-list">
          <li>Phone: {user.phone || 'Not provided'}</li>
          <li>Address: {user.address || 'Not provided'}</li>
          <li>Driving status: {user.drivingCredentials?.verified ? 'Verified' : 'Pending'}</li>
        </ul>
        {error && <p className="error-text" role="alert">{error}</p>}
      </div>

      <div className="panel">
        <p className="eyebrow">My bookings</p>
        <div className="booking-stack">
          {bookings.length ? bookings.map((booking) => (
            <div key={booking.id} className="mini-booking-card">
              <strong>{booking.bookingId}</strong>
              <span>{booking.vehicleName || booking.vehicleId}</span>
              <span>{booking.pickupDate} to {booking.returnDate}</span>
              <em>₹{booking.totalAmount}</em>
              <small>{booking.status}</small>
            </div>
          )) : <p>No bookings yet.</p>}
        </div>
      </div>
    </section>
  );
}

function AdminPage() {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(() => Boolean(getToken()));
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      return;
    }

    let active = true;
    Promise.all([
      api.get('/api/admin/stats', { headers: getAuthHeaders() }),
      api.get('/api/bookings', { headers: getAuthHeaders() }),
    ])
      .then(([statsResponse, bookingsResponse]) => {
        if (!active) return;
        setStats(statsResponse.data.stats);
        setBookings(bookingsResponse.data.bookings || []);
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.response?.data?.message || 'Unable to load admin data.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (!getToken()) {
    return (
      <div className="panel empty-state">
        <p>Admin authentication required to view system statistics.</p>
        <Link to="/login" className="primary-button">Login as admin</Link>
      </div>
    );
  }

  if (loading) {
    return <div className="panel empty-state" role="status">Loading admin dashboard...</div>;
  }

  if (!stats) {
    return (
      <div className="panel empty-state">
        <p className="error-text" role="alert">{error || 'Admin access is required to view system statistics.'}</p>
        <Link to="/login" className="primary-button">Login as admin</Link>
      </div>
    );
  }

  return (
    <section className="admin-layout">
      <div className="section-header">
        <div>
          <p className="eyebrow">Operations dashboard</p>
          <h2>Admin overview</h2>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Total users" value={stats.totalUsers} helper="Registered members" />
        <StatCard label="Fleet" value={stats.totalVehicles} helper="Active vehicles" />
        <StatCard label="Available" value={stats.availableVehicles} helper="Ready for rent" />
        <StatCard label="Total revenue" value={formatCurrency(stats.totalRevenue)} helper="Payments received" />
      </div>

      <div className="panel">
        <p className="eyebrow">Recent bookings</p>
        <div className="booking-stack">
          {bookings.map((booking) => (
            <div key={booking.id} className="mini-booking-card admin-card">
              <strong>{booking.bookingId}</strong>
              <span>{booking.vehicleName || booking.vehicleId}</span>
              <span>{booking.userId}</span>
              <em>{booking.status}</em>
              <small>₹{booking.totalAmount}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default App;
