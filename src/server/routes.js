const express = require('express');
const healthRoutes = require('./routes/healthRoutes');
const configRoutes = require('./routes/configRoutes');
const propertiesRoutes = require('./routes/propertiesRoutes');
const aiRoutes = require('./routes/aiRoutes');

const router = express.Router();

router.use(healthRoutes);
router.use(configRoutes);
router.use(propertiesRoutes);
router.use(aiRoutes);

module.exports = router;
