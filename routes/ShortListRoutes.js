
const express = require('express');
const router = express.Router();
const { updateShortListRound } = require('../controllers/shortListController');

router.post('/updateRound', updateShortListRound);

module.exports = router;
