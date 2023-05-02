const handleInput = require('../functions/inputHandler');
const Chat = require('../models/Chat');
const Session = require('../models/Session');

exports.postChat = async (req, res) => {
    const question = req.body.message.question;
    const answer = await handleInput(question.toLowerCase(), 'KMP');
    const chatDetail = {question, answer: answer[0]};
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
}