const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 3000;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Serve index.html as the default page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Enhanced version route
app.get('/enhanced', (req, res) => {
  res.sendFile(path.join(__dirname, 'index_enhanced.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Dashboard server running at http://localhost:${port}/`);
  console.log(`Enhanced dashboard available at http://localhost:${port}/enhanced`);
});
