const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');

// Import the User model
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
const allowedOrigins = [
  'https://super-starship-3327dd.netlify.app',
  'http://localhost:3000',
  'http://localhost:5173' // Added for Vite development
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect('mongodb+srv://darshanu:darshan123@inventory.tysfea0.mongodb.net/automobiles?retryWrites=true&w=majority&appName=Inventory')
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Automobile Schema
const automobileSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true }
});
const Automobile = mongoose.model('Automobile', automobileSchema);

// Authentication Middleware
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret'); // Use env variable or fallback
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password, consumer_number, address } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      consumer_number,
      address
    });
    await user.save();
    console.log(`User ${email} created successfully`);
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });
    console.log(`User ${email} signed in successfully`);
    res.json({ token });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Automobile Routes
app.get('/api/automobiles', async (req, res) => {
  try {
    const automobiles = await Automobile.find();
    res.status(200).send(automobiles);
  } catch (error) {
    console.error('Error fetching automobiles:', error);
    res.status(500).send(error);
  }
});

app.post('/api/automobiles', auth, async (req, res) => {
  try {
    const automobile = new Automobile(req.body);
    await automobile.save();
    res.status(201).send(automobile);
  } catch (error) {
    console.error('Error creating automobile:', error);
    res.status(400).send(error);
  }
});

app.put('/api/automobiles/:id', auth, async (req, res) => {
  try {
    const automobile = await Automobile.findByIdAndUpdate(req.params.id, req.body, { 
      new: true, 
      runValidators: true 
    });
    if (!automobile) return res.status(404).send();
    res.send(automobile);
  } catch (error) {
    console.error('Error updating automobile:', error);
    res.status(400).send(error);
  }
});

app.delete('/api/automobiles/:id', auth, async (req, res) => {
  try {
    const automobile = await Automobile.findByIdAndDelete(req.params.id);
    if (!automobile) return res.status(404).send();
    res.send(automobile);
  } catch (error) {
    console.error('Error deleting automobile:', error);
    res.status(500).send(error);
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});