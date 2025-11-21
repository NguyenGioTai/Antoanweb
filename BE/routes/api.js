const express = require('express');
const router = express.Router();
const hashController = require('../controllers/hashController');

router.post('/benchmark', hashController.benchmark);
router.post('/verify', hashController.verify);
router.post('/attack', hashController.attack);

module.exports = router;