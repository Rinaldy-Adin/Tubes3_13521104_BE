const handleInput = require('../functions/inputHandler');
const Chat = require('../models/Chat');
const Session = require('../models/Session');

// Defaults to KMP
let algoType = 'KMP';

exports.postChat = async (req, res) => {
    const question = req.body.message.question;
    const answer = await handleInput(question, algoType);
    const chatDetail = {question, answer: answer};
    const chat = new Chat(chatDetail);

    try {
        await chat.save();

        const session = await Session.findById(req.body["session-id"]).exec();
        session.chatLog.push(chat);
        await session.save();
        res.json({message: "Successfully added chat"})
    } catch (err) {
        return res.status(500).json({
            error: "Couldn't add chat"
        });
    }
}

exports.postAlgoType = (req, res) => {
    const type = req.body.type;
    if (type === 'KMP' || type === 'BM') {
        algoType = type;
        res.json({message: "Successfully set algo type"});
    } else {
        res.status(400).json({error: "Invalid algo type"});
    }
}