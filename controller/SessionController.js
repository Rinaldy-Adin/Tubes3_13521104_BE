const Session = require('../models/Session');
const Chat = require('../models/Chat');

// Fetch a session in database
exports.getSession = (req, res) => {
    const id = req.query.id;
    Session.findById(id, (err, session) => {
        if (err) {
            return res.status(404).json({
                error: "Could not find session"
            });
        } else {
            res.json(session);
        }
    });
}

// Create a new session
exports.createSession = (req, res) => {
    const session = new Session(req.body);
    session.save((err, session) => {
        if (err) {
            return res.status(400).json({
                error: "Could not save session"
            });
        } else {
            res.json(session);
        }
    });
}

// Delete a session
exports.deleteSession = (req, res) => {
    const id = req.params.id;
    Session.findByIdAndDelete(id, (err) => {
        if (err) {
            return res.status(400).json({
                error: "Could not delete session"
            });
        } else {
            res.json({
                message: "Session deleted successfully"
            });
        }
    });
}

// Add a chat to a session
exports.addChat = (req, res) => {
    const id = req.params.id;
    const chat = new Chat(req.body);
    Session.findByIdAndUpdate(id, { $push: { chats: chat } }, (err, session) => {
        if (err) {
            return res.status(400).json({
                error: "Could not add chat to session"
            });
        } else {
            res.json(session);
        }
    });
}