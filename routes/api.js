const express = require('express');
const Question = require('../models/Question');

const router = express.Router();

router.get('/', (req, res) => {
    res.send('hello');
});

router.get('/question', (req, res) => {
    const questionDetail = { question: 'hello', answer: 'hi' };

    const question = new Question(questionDetail);

    question.save().then(() => {
        console.log('saved');
    });

    res.send('hello from question');
});

module.exports = router;
