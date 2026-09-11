const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const dashboardController = require('../controllers/dashboard.controller');

router.get('/', auth, dashboardController.getStats);

module.exports = router;
