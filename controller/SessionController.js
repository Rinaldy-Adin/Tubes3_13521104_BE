const Session = require('../models/Session');
const Chat = require('../models/Chat');

// Fetch a session in database
// exports.getSession = (req, res) => {
//     const id = req.query.id;
//     Session.findById(id, (err, session) => {
//         if (err) {
//             return res.status(404).json({
//                 error: "Could not find session"
//             });
//         } else {
//             res.json(session);
//         }
//     });
// }

// Create a new session
exports.createSession = (req, res) => {
    const session = new Session(req.body);
    session.save((err, session) => {
        if (err) {
            return res.status(400).json({
                error: 'Could not save session',
            });
        } else {
            res.json(session);
        }
    });
};

// Delete a session
exports.deleteSession = (req, res) => {
    const id = req.params.id;
    Session.findByIdAndDelete(id, (err) => {
        if (err) {
            return res.status(400).json({
                error: 'Could not delete session',
            });
        } else {
            res.json({
                message: 'Session deleted successfully',
            });
        }
    });
};

// Add a chat to a session
exports.addChat = (req, res) => {
    const id = req.params.id;
    const chat = new Chat(req.body);
    Session.findByIdAndUpdate(
        id,
        { $push: { chats: chat } },
        (err, session) => {
            if (err) {
                return res.status(400).json({
                    error: 'Could not add chat to session',
                });
            } else {
                res.json(session);
            }
        }
    );
};

// TODO: finish
exports.getAllSessions = (req, res) => {
    res.set('Access-Control-Allow-Origin', 'https://crdgpt.vercel.app');
    Session.find({})
        .exec()
        .then((sessions) => {
            res.json({
                sessions: sessions.map(({ _id }) => ({
                    id: _id.toString(),
                    name: 'chat',
                })),
            });
        })
        .catch((err) => {
            return res.status(500).json({
                error: "Couldn't get sessions",
            });
        });
};

exports.getSession = (req, res) => {
    Session.findById(req.query.id)
        .populate('chatLog')
        .exec()
        .then((session) => {
            res.json({ chatLog: session.chatLog });
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({
                error: "Couldn't get sesssion",
            });
        });
};

exports.clearSession = async (req, res) => {
    try {
        const session = await Session.findById(req.query.id);
        await Promise.all(session.chatLog.map(chatId => Chat.findByIdAndDelete(chatId)));
        await session.deleteOne();
        res.json({ message: 'Clear success' });
    } catch (err) {
        return res.status(500).json({
            error: "Couldn't clear sesssions",
        });
    }
};

exports.clearAllSessions = (req, res) => {
    Chat.deleteMany({})
        .then(() => {
            Session.deleteMany({})
                .then(() => {
                    res.json({ message: 'Clear success' });
                });
        })
        .catch(() => {
            return res.status(500).json({
                error: "Couldn't clear sessions",
            });
        });
};

exports.getNewSession = (req, res) => {
    const session = new Session({ chatLog: [] });
    session
        .save()
        .then(() => {
            res.json({ id: session.id });
        })
        .catch(() => {
            return res.status(500).json({
                error: "Couldn't add session",
            });
        });
};
