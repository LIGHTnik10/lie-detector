const express = require('express');
const path = require('path');

const app = express();

// Serve static files from client dist
app.use(express.static(path.join(__dirname, '../client/dist')));

// Serve client for all routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
