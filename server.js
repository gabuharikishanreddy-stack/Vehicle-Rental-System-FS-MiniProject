const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "vehicle-rental-secret-key";
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/VehicleRentalDB";

app.use(cors());
app.use(express.json());

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: "customer" },
    phone: String,
    address: String,
    status: { type: String, default: "active" },
    licenseNumber: String,
    drivingCredentials: {
      type: Object,
      default: {
        verified: false,
        licenseType: "Car",
        expiryDate: "2028-12-31",
      },
    },
  },
  { timestamps: true }
);

const vehicleSchema = new mongoose.Schema(
  {
    name: String,
    brand: String,
    model: String,
    year: Number,
    category: String,
    fuelType: String,
    transmission: String,
    seatingCapacity: Number,
    dailyRate: Number,
    location: String,
    status: { type: String, default: "Available" },
    features: [String],
    image: String,
    description: String,
  },
  { timestamps: true }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingId: String,
    userId: String,
    vehicleId: String,
    pickupDate: String,
    returnDate: String,
    pickupLocation: String,
    returnLocation: String,
    totalAmount: Number,
    status: { type: String, default: "Confirmed" },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Vehicle = mongoose.models.Vehicle || mongoose.model("Vehicle", vehicleSchema);
const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

const inMemoryStore = {
  users: [
    {
      id: "usr_1",
      name: "Aarav Nair",
      email: "customer@vehiclerental.com",
      passwordHash: bcrypt.hashSync("Password123", 10),
      role: "customer",
      phone: "9876543210",
      address: "Koramangala, Bengaluru",
      status: "active",
      licenseNumber: "DL-28-2023",
      drivingCredentials: { verified: true, licenseType: "Car", expiryDate: "2028-12-31" },
    },
    {
      id: "usr_2",
      name: "Admin User",
      email: "admin@vehiclerental.com",
      passwordHash: bcrypt.hashSync("Admin@123", 10),
      role: "admin",
      phone: "9123456789",
      address: "Head Office, Bengaluru",
      status: "active",
      licenseNumber: "DL-40-2021",
      drivingCredentials: { verified: true, licenseType: "Car", expiryDate: "2027-11-30" },
    },
  ],
  vehicles: [
    {
      id: "veh_1",
      name: "BMW X5",
      brand: "BMW",
      model: "X5",
      year: 2024,
      category: "SUV",
      fuelType: "Diesel",
      transmission: "Automatic",
      seatingCapacity: 5,
      dailyRate: 5250,
      location: "Koramangala",
      status: "Available",
      features: ["GPS", "Sunroof", "ABS", "Bluetooth"],
      image: "image1.jpeg",
      description: "Luxury SUV, ideal for family trips and business travel.",
    },
    {
      id: "veh_2",
      name: "Maruti Swift",
      brand: "Maruti",
      model: "Swift",
      year: 2023,
      category: "Hatchback",
      fuelType: "Petrol",
      transmission: "Manual",
      seatingCapacity: 5,
      dailyRate: 2250,
      location: "Indiranagar",
      status: "Available",
      features: ["AC", "Power Steering", "USB Charging"],
      image: "image2.jpeg",
      description: "City-friendly hatchback perfect for daily commuting.",
    },
    {
      id: "veh_3",
      name: "Mercedes C-Class",
      brand: "Mercedes",
      model: "C-Class",
      year: 2024,
      category: "Sedan",
      fuelType: "Petrol",
      transmission: "Automatic",
      seatingCapacity: 5,
      dailyRate: 4500,
      location: "Whitefield",
      status: "Reserved",
      features: ["Leather Seats", "Navigation", "Adaptive Cruise Control"],
      image: "image3.jpeg",
      description: "Premium sedan with high-end comfort and performance.",
    },
    {
      id: "veh_4",
      name: "Hyundai Creta",
      brand: "Hyundai",
      model: "Creta",
      year: 2024,
      category: "SUV",
      fuelType: "Petrol",
      transmission: "Automatic",
      seatingCapacity: 5,
      dailyRate: 3750,
      location: "Jayanagar",
      status: "Available",
      features: ["AC", "Rear Camera", "Bluetooth", "Cruise Control"],
      image: "image4.jpeg",
      description: "Comfortable compact SUV suited to city drives and weekend trips.",
    },
    {
      id: "veh_5",
      name: "Toyota Innova Crysta",
      brand: "Toyota",
      model: "Innova Crysta",
      year: 2024,
      category: "MPV",
      fuelType: "Diesel",
      transmission: "Automatic",
      seatingCapacity: 7,
      dailyRate: 5000,
      location: "Koramangala",
      status: "Available",
      features: ["Three-row Seating", "AC", "Rear Camera", "USB Charging"],
      image: "image5.jpeg",
      description: "Spacious seven-seater for family holidays and group travel.",
    },
    {
      id: "veh_6",
      name: "Honda City",
      brand: "Honda",
      model: "City",
      year: 2023,
      category: "Sedan",
      fuelType: "Petrol",
      transmission: "Automatic",
      seatingCapacity: 5,
      dailyRate: 3250,
      location: "Indiranagar",
      status: "Available",
      features: ["AC", "Navigation", "Cruise Control", "Bluetooth"],
      image: "image6.jpeg",
      description: "Refined and practical sedan for comfortable everyday travel.",
    },
    {
      id: "veh_7",
      name: "Tata Nexon",
      brand: "Tata",
      model: "Nexon",
      year: 2024,
      category: "SUV",
      fuelType: "Petrol",
      transmission: "Manual",
      seatingCapacity: 5,
      dailyRate: 3000,
      location: "Whitefield",
      status: "Available",
      features: ["ABS", "Rear Camera", "Bluetooth", "USB Charging"],
      image: "image7.jpeg",
      description: "Versatile compact SUV with useful safety and connectivity features.",
    },
    {
      id: "veh_8",
      name: "Kia Seltos",
      brand: "Kia",
      model: "Seltos",
      year: 2024,
      category: "SUV",
      fuelType: "Diesel",
      transmission: "Automatic",
      seatingCapacity: 5,
      dailyRate: 4000,
      location: "HSR Layout",
      status: "Available",
      features: ["Sunroof", "Navigation", "Rear Camera", "Bluetooth"],
      image: "image8.jpeg",
      description: "Feature-rich SUV with a comfortable cabin for longer journeys.",
    },
    {
      id: "veh_9",
      name: "Maruti Baleno",
      brand: "Maruti",
      model: "Baleno",
      year: 2023,
      category: "Hatchback",
      fuelType: "Petrol",
      transmission: "Automatic",
      seatingCapacity: 5,
      dailyRate: 2500,
      location: "Malleshwaram",
      status: "Available",
      features: ["AC", "Rear Camera", "Power Steering", "USB Charging"],
      image: "image9.jpeg",
      description: "Easy-to-drive hatchback with a roomy interior and efficient city handling.",
    },
    {
      id: "veh_10",
      name: "Volkswagen Virtus",
      brand: "Volkswagen",
      model: "Virtus",
      year: 2024,
      category: "Sedan",
      fuelType: "Petrol",
      transmission: "Automatic",
      seatingCapacity: 5,
      dailyRate: 3750,
      location: "Electronic City",
      status: "Available",
      features: ["Cruise Control", "Navigation", "ABS", "Bluetooth"],
      image: "image10.jpeg",
      description: "Well-equipped sedan offering a composed ride for business or leisure.",
    },
    {
      id: "veh_11",
      name: "Mahindra XUV700",
      brand: "Mahindra",
      model: "XUV700",
      year: 2024,
      category: "SUV",
      fuelType: "Diesel",
      transmission: "Automatic",
      seatingCapacity: 7,
      dailyRate: 5500,
      location: "Sarjapur",
      status: "Available",
      features: ["Seven Seats", "Panoramic Sunroof", "Navigation", "Rear Camera"],
      image: "image11.jpeg",
      description: "Powerful seven-seat SUV with space for the whole family.",
    },
    {
      id: "veh_12",
      name: "Audi A4",
      brand: "Audi",
      model: "A4",
      year: 2024,
      category: "Luxury Sedan",
      fuelType: "Petrol",
      transmission: "Automatic",
      seatingCapacity: 5,
      dailyRate: 7500,
      location: "Whitefield",
      status: "Available",
      features: ["Leather Seats", "Navigation", "Sunroof", "Adaptive Cruise Control"],
      image: "image12.jpeg",
      description: "Premium executive sedan with a refined interior and smooth performance.",
    },
    {
      id: "veh_13",
      name: "BMW 3 Series",
      brand: "BMW",
      model: "3 Series",
      year: 2024,
      category: "Luxury Sedan",
      fuelType: "Petrol",
      transmission: "Automatic",
      seatingCapacity: 5,
      dailyRate: 8250,
      location: "Koramangala",
      status: "Available",
      features: ["Leather Seats", "Navigation", "Parking Sensors", "Bluetooth"],
      image: "image13.jpeg",
      description: "Sporty luxury sedan for a premium driving experience.",
    },
    {
      id: "veh_14",
      name: "Jeep Compass",
      brand: "Jeep",
      model: "Compass",
      year: 2023,
      category: "SUV",
      fuelType: "Diesel",
      transmission: "Automatic",
      seatingCapacity: 5,
      dailyRate: 5000,
      location: "Indiranagar",
      status: "Available",
      features: ["4x4", "Navigation", "Rear Camera", "Cruise Control"],
      image: "image14.jpeg",
      description: "Adventure-ready SUV with a confident ride for city and highway routes.",
    },
    {
      id: "veh_15",
      name: "Hyundai Venue",
      brand: "Hyundai",
      model: "Venue",
      year: 2024,
      category: "SUV",
      fuelType: "Petrol",
      transmission: "Manual",
      seatingCapacity: 5,
      dailyRate: 2750,
      location: "Jayanagar",
      status: "Available",
      features: ["AC", "Rear Camera", "Bluetooth", "Power Steering"],
      image: "image15.jpeg",
      description: "Compact crossover that's convenient to park and comfortable to drive.",
    },
    {
      id: "veh_16",
      name: "Mercedes-Benz GLC",
      brand: "Mercedes-Benz",
      model: "GLC",
      year: 2024,
      category: "Luxury SUV",
      fuelType: "Diesel",
      transmission: "Automatic",
      seatingCapacity: 5,
      dailyRate: 9000,
      location: "Whitefield",
      status: "Available",
      features: ["Leather Seats", "Panoramic Sunroof", "Navigation", "Parking Sensors"],
      image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=900&q=80",
      description: "Premium SUV combining generous comfort with confident performance.",
    },
    {
      id: "veh_17",
      name: "Renault Kwid",
      brand: "Renault",
      model: "Kwid",
      year: 2023,
      category: "Hatchback",
      fuelType: "Petrol",
      transmission: "Manual",
      seatingCapacity: 5,
      dailyRate: 2000,
      location: "Electronic City",
      status: "Available",
      features: ["AC", "Power Steering", "USB Charging"],
      image: "image17.jpeg",
      description: "Budget-friendly compact car for errands and short city trips.",
    },
    {
      id: "veh_18",
      name: "Toyota Fortuner",
      brand: "Toyota",
      model: "Fortuner",
      year: 2024,
      category: "SUV",
      fuelType: "Diesel",
      transmission: "Automatic",
      seatingCapacity: 7,
      dailyRate: 7000,
      location: "Sarjapur",
      status: "Available",
      features: ["Seven Seats", "4x4", "Rear Camera", "Cruise Control"],
      image: "https://upload.wikimedia.org/wikipedia/commons/8/81/2017-2018_Toyota_Fortuner_%28AN160%29_2.4_V_SUV_%2822-03-2018%29_01.jpg",
      description: "Large, capable SUV designed for family travel and long-distance drives.",
    },
  ],
  bookings: [
    {
      id: "bk_101",
      bookingId: "BK-101",
      userId: "usr_1",
      vehicleId: "veh_1",
      pickupDate: "2026-10-10",
      returnDate: "2026-10-15",
      pickupLocation: "Koramangala",
      returnLocation: "Koramangala",
      totalAmount: 21000,
      status: "Confirmed",
    },
  ],
  payments: [
    {
      id: "pay_1",
      bookingId: "BK-101",
      customer: "Aarav Nair",
      amount: 21000,
      method: "Card",
      transactionId: "TXN-9001",
      date: "2026-10-08",
      status: "Successful",
    },
  ],
  notifications: [
    { id: "nt_1", userId: "usr_1", title: "Booking confirmed", message: "Your BMW X5 booking has been confirmed.", read: false },
    { id: "nt_2", userId: "usr_1", title: "Driver verification", message: "Your driving license is verified.", read: true },
  ],
  reviews: [
    { id: "rv_1", userId: "usr_1", vehicleId: "veh_1", rating: 5, comment: "Excellent SUV and smooth pickup process." },
  ],
  supportTickets: [
    { id: "st_1", userId: "usr_1", subject: "Need booking modification", status: "Open", priority: "Medium", message: "I want to extend my booking by two days." },
  ],
  invoices: [
    {
      id: "inv_1",
      bookingId: "BK-101",
      customer: "Aarav Nair",
      vehicle: "BMW X5",
      baseAmount: 21000,
      discount: 0,
      tax: 1680,
      finalAmount: 22680,
      paymentStatus: "Successful",
    },
  ],
};

const localStorePath = path.join(__dirname, "data", "vehicle-rental-store.json");

function loadLocalData() {
  if (!fs.existsSync(localStorePath)) return;

  const localData = JSON.parse(fs.readFileSync(localStorePath, "utf8"));
  if (!Array.isArray(localData.users) || !Array.isArray(localData.bookings)) {
    throw new Error(`Invalid local data file at ${localStorePath}: users and bookings must be arrays.`);
  }

  inMemoryStore.users = localData.users;
  inMemoryStore.bookings = localData.bookings;
}

function persistLocalData() {
  const directory = path.dirname(localStorePath);
  fs.mkdirSync(directory, { recursive: true });
  const temporaryPath = `${localStorePath}.tmp`;
  const contents = JSON.stringify({
    users: inMemoryStore.users,
    bookings: inMemoryStore.bookings,
  }, null, 2);

  try {
    fs.writeFileSync(temporaryPath, contents, "utf8");
    fs.renameSync(temporaryPath, localStorePath);
  } catch (error) {
    if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath);
    throw error;
  }
}

loadLocalData();

let mongoReady = false;

async function connectDatabase() {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    mongoReady = true;
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.warn("MongoDB connection failed. Running in demo mode:", error.message);
  }
}

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
}

function getUserFromToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

function getUserById(id) {
  return inMemoryStore.users.find((user) => user.id === id) || null;
}

function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function calculateBookingCost({ dailyRate = 0, days = 1, discount = 0, taxRate = 0.12, damageCharges = 0, additionalCharges = 0 }) {
  const subtotal = dailyRate * days;
  const discountAmount = subtotal * discount;
  const taxableAmount = Math.max(subtotal - discountAmount + additionalCharges + damageCharges, 0);
  const tax = taxableAmount * taxRate;
  const total = taxableAmount + tax;

  return {
    days,
    baseAmount: subtotal,
    discount: discountAmount,
    additionalCharges,
    damageCharges,
    tax,
    total,
  };
}

function overlapBookingExists(vehicleId, pickupDate, returnDate) {
  const requestedStart = new Date(pickupDate).getTime();
  const requestedEnd = new Date(returnDate).getTime();

  return inMemoryStore.bookings.some((booking) => {
    if (booking.vehicleId !== vehicleId || booking.status === "Cancelled") return false;
    const currentStart = new Date(booking.pickupDate).getTime();
    const currentEnd = new Date(booking.returnDate).getTime();
    return requestedStart <= currentEnd && requestedEnd >= currentStart;
  });
}

app.get("/", (req, res) => {
  res.json({ message: "Vehicle Rental System Backend is Running!", status: "healthy" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", mongoReady });
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (typeof name !== "string" || !name.trim() || typeof email !== "string" || !email.trim() || typeof password !== "string") {
      return res.status(400).json({ message: "Name, email and password are required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }

    const existingUser = inMemoryStore.users.find((user) => user.email.toLowerCase() === normalizedEmail);
    if (existingUser) {
      return res.status(409).json({ message: "User with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      id: `usr_${crypto.randomUUID()}`,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "customer",
      phone: typeof phone === "string" ? phone.trim() : "",
      address: typeof address === "string" ? address.trim() : "",
      status: "active",
      licenseNumber: "",
      drivingCredentials: { verified: false, licenseType: "Car", expiryDate: "2028-12-31" },
    };

    inMemoryStore.users.push(user);
    try {
      persistLocalData();
    } catch (error) {
      inMemoryStore.users.pop();
      console.error("Register persistence error:", error);
      return res.status(500).json({ message: "Unable to save your account. Please try again." });
    }

    const token = generateToken(user);
    return res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Unable to register user." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== "string" || !email.trim() || typeof password !== "string" || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = inMemoryStore.users.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    return res.json({ token: generateToken(user), user: sanitizeUser(user) });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Unable to login." });
  }
});

app.get("/api/users/profile", (req, res) => {
  const payload = getUserFromToken(req);
  if (!payload) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  const user = getUserById(payload.id);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  return res.json({ user: sanitizeUser(user) });
});

app.put("/api/users/profile", (req, res) => {
  const payload = getUserFromToken(req);
  if (!payload) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  const user = getUserById(payload.id);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  user.name = req.body.name || user.name;
  user.phone = req.body.phone || user.phone;
  user.address = req.body.address || user.address;
  user.licenseNumber = req.body.licenseNumber || user.licenseNumber;
  if (req.body.drivingCredentials) {
    user.drivingCredentials = { ...user.drivingCredentials, ...req.body.drivingCredentials };
  }

  return res.json({ user: sanitizeUser(user) });
});

app.get("/api/vehicles", (req, res) => {
  const { search, category, location } = req.query;
  let list = [...inMemoryStore.vehicles];

  if (search) {
    list = list.filter((vehicle) => `${vehicle.name} ${vehicle.brand} ${vehicle.model}`.toLowerCase().includes(search.toLowerCase()));
  }

  if (category) {
    list = list.filter((vehicle) => vehicle.category.toLowerCase() === category.toLowerCase());
  }

  if (location) {
    list = list.filter((vehicle) => vehicle.location.toLowerCase().includes(location.toLowerCase()));
  }

  return res.json({ vehicles: list });
});

app.get("/api/vehicles/:id", (req, res) => {
  const vehicle = inMemoryStore.vehicles.find((item) => item.id === req.params.id);
  if (!vehicle) {
    return res.status(404).json({ message: "Vehicle not found." });
  }

  return res.json({ vehicle });
});

app.post("/api/vehicles", (req, res) => {
  const vehicle = { id: `veh_${crypto.randomUUID()}`, ...req.body };
  inMemoryStore.vehicles.push(vehicle);
  return res.status(201).json({ vehicle });
});

app.get("/api/categories", (req, res) => {
  const categories = [...new Set(inMemoryStore.vehicles.map((vehicle) => vehicle.category))];
  return res.json({ categories });
});

app.get("/api/bookings", (req, res) => {
  const payload = getUserFromToken(req);
  if (!payload) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  const userBookings = inMemoryStore.bookings.filter((booking) => {
    if (payload.role === "admin") return true;
    return booking.userId === payload.id;
  });

  return res.json({ bookings: userBookings });
});

app.post("/api/bookings", (req, res) => {
  const payload = getUserFromToken(req);
  if (!payload) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  const { vehicleId, pickupDate, returnDate, pickupLocation, returnLocation, discount = 0 } = req.body;
  const vehicle = inMemoryStore.vehicles.find((item) => item.id === vehicleId);

  if (!vehicle) {
    return res.status(404).json({ message: "Vehicle not found." });
  }

  const isValidDate = (value) => {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parsedDate = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === value;
  };

  if (!isValidDate(pickupDate) || !isValidDate(returnDate)) {
    return res.status(400).json({ message: "Choose valid pickup and return dates." });
  }

  const today = new Date().toISOString().slice(0, 10);
  if (pickupDate < today) {
    return res.status(400).json({ message: "Pickup date cannot be in the past." });
  }

  if (returnDate < pickupDate) {
    return res.status(400).json({ message: "Return date must be on or after pickup date." });
  }

  const discountPercent = Number(discount);
  if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 50) {
    return res.status(400).json({ message: "Discount must be between 0 and 50 percent." });
  }

  if (overlapBookingExists(vehicleId, pickupDate, returnDate)) {
    return res.status(409).json({ message: "Vehicle is unavailable for the selected dates." });
  }

  const days = Math.max(1, Math.ceil((new Date(returnDate) - new Date(pickupDate)) / (1000 * 60 * 60 * 24)) + 1);
  const cost = calculateBookingCost({ dailyRate: vehicle.dailyRate, days, discount: discountPercent / 100 });

  const booking = {
    id: `bk_${crypto.randomUUID()}`,
    bookingId: `BK-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    userId: payload.id,
    vehicleId,
    vehicleName: vehicle.name,
    pickupDate,
    returnDate,
    pickupLocation: typeof pickupLocation === "string" && pickupLocation.trim() ? pickupLocation.trim() : vehicle.location,
    returnLocation: typeof returnLocation === "string" && returnLocation.trim()
      ? returnLocation.trim()
      : (typeof pickupLocation === "string" && pickupLocation.trim() ? pickupLocation.trim() : vehicle.location),
    totalAmount: Math.round(cost.total),
    status: "Confirmed",
  };

  inMemoryStore.bookings.push(booking);
  try {
    persistLocalData();
  } catch (error) {
    inMemoryStore.bookings.pop();
    console.error("Booking persistence error:", error);
    return res.status(500).json({ message: "Unable to save your booking. Please try again." });
  }

  return res.status(201).json({ booking, pricing: cost });
});

app.get("/api/pricing", (req, res) => {
  const { dailyRate, days, discount, taxRate, damageCharges, additionalCharges } = req.query;
  const result = calculateBookingCost({
    dailyRate: Number(dailyRate || 0),
    days: Number(days || 1),
    discount: Number(discount || 0) / 100,
    taxRate: Number(taxRate || 0.12),
    damageCharges: Number(damageCharges || 0),
    additionalCharges: Number(additionalCharges || 0),
  });

  return res.json({ pricing: result });
});

app.get("/api/payments", (req, res) => {
  return res.json({ payments: inMemoryStore.payments });
});

app.post("/api/payments", (req, res) => {
  const { bookingId, customer, amount, method = "Card" } = req.body;
  const payment = {
    id: `pay_${crypto.randomUUID().slice(0, 8)}`,
    bookingId,
    customer,
    amount,
    method,
    transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
    date: new Date().toISOString().slice(0, 10),
    status: "Successful",
  };

  inMemoryStore.payments.push(payment);
  return res.status(201).json({ payment });
});

app.get("/api/invoices", (req, res) => {
  return res.json({ invoices: inMemoryStore.invoices });
});

app.get("/api/notifications", (req, res) => {
  const payload = getUserFromToken(req);
  if (!payload) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  const notifications = inMemoryStore.notifications.filter((notification) => notification.userId === payload.id);
  return res.json({ notifications });
});

app.get("/api/reviews", (req, res) => {
  const { vehicleId } = req.query;
  let reviews = inMemoryStore.reviews;
  if (vehicleId) {
    reviews = reviews.filter((review) => review.vehicleId === vehicleId);
  }
  return res.json({ reviews });
});

app.post("/api/reviews", (req, res) => {
  const payload = getUserFromToken(req);
  if (!payload) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  const review = {
    id: `rv_${crypto.randomUUID().slice(0, 8)}`,
    userId: payload.id,
    ...req.body,
  };

  inMemoryStore.reviews.push(review);
  return res.status(201).json({ review });
});

app.get("/api/support", (req, res) => {
  const payload = getUserFromToken(req);
  if (!payload) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  const tickets = inMemoryStore.supportTickets.filter((ticket) => payload.role === "admin" || ticket.userId === payload.id);
  return res.json({ tickets });
});

app.post("/api/support", (req, res) => {
  const payload = getUserFromToken(req);
  if (!payload) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  const ticket = {
    id: `st_${crypto.randomUUID().slice(0, 8)}`,
    userId: payload.id,
    subject: req.body.subject || "General support",
    status: "Open",
    priority: req.body.priority || "Medium",
    message: req.body.message || "",
  };

  inMemoryStore.supportTickets.push(ticket);
  return res.status(201).json({ ticket });
});

app.get("/api/admin/stats", (req, res) => {
  const payload = getUserFromToken(req);
  if (!payload || payload.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }

  const stats = {
    totalUsers: inMemoryStore.users.length,
    totalVehicles: inMemoryStore.vehicles.length,
    availableVehicles: inMemoryStore.vehicles.filter((v) => v.status === "Available").length,
    rentedVehicles: inMemoryStore.vehicles.filter((v) => v.status === "Reserved").length,
    totalBookings: inMemoryStore.bookings.length,
    activeRentals: inMemoryStore.bookings.filter((b) => b.status === "Confirmed").length,
    completedRentals: inMemoryStore.bookings.filter((b) => b.status === "Completed").length,
    pendingPayments: inMemoryStore.payments.filter((p) => p.status === "Pending").length,
    totalRevenue: inMemoryStore.payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
  };

  return res.json({ stats });
});

connectDatabase();

app.listen(PORT, () => {
  console.log(`Vehicle Rental System API running on http://localhost:${PORT}`);
});