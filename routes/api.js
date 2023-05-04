const express = require('express');
const inputHandler = require('../functions/inputHandler');
const ChatController = require('../controller/ChatController');
const SessionController = require('../controller/SessionController');

const router = express.Router();

router.get('/', (req, res) => {res.send("working")});

router.get('/all-sessions', SessionController.getAllSessions);
router.get('/session', SessionController.getSession);
router.get('/clear-session', SessionController.clearSession);
router.get('/clear-all-sessions', SessionController.clearAllSessions);
router.get('/new-session', SessionController.getNewSession);

router.post('/chat', ChatController.postChat);
router.post('/algotype', ChatController.postAlgoType);

module.exports = router;
