const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // Using bcryptjs
const path = require('path');

// Import the User model
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
const allowedOrigins = [
  'https://suii-3iyc.onrender.com',
  'https://thriving-sable-8aa5dc.netlify.app',
  'http://localhost:3000',
  'http://localhost:5173'
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

// Root Route
app.get('/', (req, res) => {
  res.send('Welcome to the MERN Backend API');
});

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

app.get('/api/auth/signup', (req, res) => {
  res.status(405).json({ message: 'Method Not Allowed. Use POST to create a new user.' });
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

    console.log(`User ${email} signed in successfully`);
    res.status(200).json({ message: 'Sign in successful' });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/auth/signin', (req, res) => {
  res.status(405).json({ message: 'Method Not Allowed. Use POST to sign in with email and password.' });
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

app.post('/api/automobiles', async (req, res) => {
  try {
    const automobile = new Automobile(req.body);
    await automobile.save();
    res.status(201).send(automobile);
  } catch (error) {
    console.error('Error creating automobile:', error);
    res.status(400).send(error);
  }
});

app.get('/api/automobiles/:id', async (req, res) => {
  try {
    const automobile = await Automobile.findById(req.params.id);
    if (!automobile) return res.status(404).send();
    res.status(200).send(automobile);
  } catch (error) {
    console.error('Error fetching automobile:', error);
    res.status(500).send(error);
  }
});

app.put('/api/automobiles/:id', async (req, res) => {
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

app.get('/api/automobiles/:id', (req, res) => {
  res.status(405).json({ message: 'Method Not Allowed. Use PUT to update an automobile.' });
});

app.delete('/api/automobiles/:id', async (req, res) => {
  try {
    const automobile = await Automobile.findByIdAndDelete(req.params.id);
    if (!automobile) return res.status(404).send();
    res.send(automobile);
  } catch (error) {
    console.error('Error deleting automobile:', error);
    res.status(500).send(error);
  }
});

app.get('/api/automobiles/:id', (req, res) => {
  res.status(405).json({ message: 'Method Not Allowed. Use DELETE to delete an automobile.' });
});

// Global Error Handler for Unhandled Routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});