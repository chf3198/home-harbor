const path = require('path');
const express = require('express');
const apiRoutes = require('./routes');

function createApp() {
  const app = express();

  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..', '..', 'public')));

  app.use('/api', apiRoutes);

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'public', 'index.html'));
  });

  return app;
}

module.exports = { createApp };
