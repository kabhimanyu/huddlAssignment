const express = require('express');
const app = require('@config/express');

const router = express.Router();

router.get('/status', (req, res) => res.send('OK'));

module.exports = router;