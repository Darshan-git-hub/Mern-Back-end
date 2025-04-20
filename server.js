const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = 'mongodb+srv://darshanu:darshan123@inventory.tysfea0.mongodb.net/automobiles?retryWrites=true&w=majority&appName=Inventory';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => res.send('API is running'));

const automobileSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true }
});
const Automobile = mongoose.model('Automobile', automobileSchema);

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});