const express = require('express');
const calendarificController = require('../controllers/calendarificController.js');
const router = express.Router();

router.route('/holidays').get(calendarificController.getHolidays);
router.route('/countries').get(calendarificController.getCountries);

module.exports = router;