const express = require('express');
const { getHealth } = require('../dataService');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json(getHealth());
});

module.exports = router;
