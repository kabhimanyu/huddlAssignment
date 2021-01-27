const express = require('express');
const authRoutes = require('./auth.route');
const commentRoutes = require('./comment.route');

const router = express.Router();

router.get('/status', (req, res) => res.send('OK'));

router.use('/auth', authRoutes);
router.use('/comment', commentRoutes);

module.exports = router;