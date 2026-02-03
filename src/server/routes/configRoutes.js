const express = require('express');
const { getConfig } = require('../configService');

const router = express.Router();

router.get('/config', (req, res) => {
  res.json(getConfig());
});

module.exports = router;
