const express = require('express');
const inputHandler = require('../functions/inputHandler');
const Chat = require('../models/Chat')

const router = express.Router();

router.post('/question', (req, res) => {
    const question = req.body.message.question;
    const answer = inputHandler(question);

    res.json({question, answer})
});

router.get('/session/', (req, res) => {

})

module.exports = router;
