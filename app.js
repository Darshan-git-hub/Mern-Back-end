const express = require('express');
const cors = require('cors');
const path = require('path');
const automobileRoutes = require('./routes/automobileRoutes');

const app = express();

// Middleware
app.use(cors()); // Enable CORS for cross-origin requests
app.use(express.json()); // Parse JSON bodies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files (e.g., React build)

// Routes
app.use('/api/automobiles', automobileRoutes); // Mount automobile routes

// Catch-all route for React frontend (handles client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;