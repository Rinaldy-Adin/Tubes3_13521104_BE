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

router.post('/algotype', (req, res) => {
    const type = req.body.type;
    switch (type) {
        case 'KMP':
            // Pilih KMP
            console.log("KMP");
            break;
        case 'BM':
            // Pilih BM
            console.log("BM");
            break;
        default:
            break;
    }
});

module.exports = router;
