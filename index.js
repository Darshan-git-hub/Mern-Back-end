const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const User = require('./models/User');

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://darshanu:darshan123@inventory.tysfea0.mongodb.net/automobiles?retryWrites=true&w=majority&appName=Inventory';

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Root Route
app.get('/', (req, res) => {
  console.log('Root route hit');
  res.send('API is running');
});

// Automobile Schema
const automobileSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true }
});
const Automobile = mongoose.model('Automobile', automobileSchema);

// GET all automobiles
app.get('/api/automobiles', async (req, res) => {
  console.log('Automobiles route hit');
  try {
    const automobiles = await Automobile.find();
    res.status(200).send(automobiles);
  } catch (error) {
    console.error('Error fetching automobiles:', error);
    res.status(500).send(error);
  }
});

// POST a new automobile
app.post('/api/automobiles', async (req, res) => {
  console.log('Post route hit:', req.body);
  try {
    const automobile = new Automobile(req.body);
    await automobile.save();
    res.status(201).send(automobile);
  } catch (error) {
    console.error('Error creating automobile:', error);
    res.status(400).send(error);
  }
});

// PUT (update) an automobile by ID
app.put('/api/automobiles/:id', async (req, res) => {
  console.log('Put route hit for ID:', req.params.id, 'with data:', req.body);
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

// DELETE an automobile by ID
app.delete('/api/automobiles/:id', async (req, res) => {
  console.log('Delete route hit for ID:', req.params.id);
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