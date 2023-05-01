const Question = require('../models/Question');
const { kmp, boyerMoore, levenshteinDistance } = require('../functions/stringMatching');

// Add question to the database
exports.addQuestion = (req, res) => {
  const question = new Question({
    question: req.body.question,
    answer: req.body.answer
  });
  
  question.save((err) => {
    if (err) {
      return res.status(400).json({
        error: "Could not save question to database"
      });
    }
    res.json({
      message: "Question added successfully"
    });
  });
};

// Delete question from the database
exports.deleteQuestion = (req, res) => {
  const id = req.params.id;
  Question.findByIdAndDelete(id, (err) => {
    if (err) {
      return res.status(400).json({
        error: "Could not delete question from database"
      });
    }
    res.json({
      message: "Question deleted successfully"
    });
  });
};

// Get a single question by ID
exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    return res.status(200).json(question);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Update a question by ID
exports.updateQuestionById = async (req, res) => {
  try {
    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.questionId,
      req.body,
      { new: true }
    );
    if (!updatedQuestion) {
      return res.status(404).json({ message: 'Question not found' });
    }
    return res.status(200).json(updatedQuestion);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Controller to fetch answer for a question
exports.getAnswer = async (req, res) => {
    const { input } = req.body;
  
    try {
      // Find exact match using KMP or Boyer-Moore
      // TODO: Differ between KMP and Boyer-Moore based off of user input
      const questions = await Question.find();
      const exactMatches = questions.filter(q => kmp(q.question, input) !== -1 || boyerMoore(q.question, input) !== -1);
      if (exactMatches.length > 0) {
        const exactMatch = exactMatches[0];
        return res.status(200).json({ answer: exactMatch.answer });
      }
  
      // Find answer with least levenshtein distance
      // TODO: Set threshold for minimal distance to provide answer
      let minDistance = Infinity;
      let closestQuestion = '';
      for (const q of questions) {
        const distance = levenshteinDistance(input, q.question);
        if (distance < minDistance) {
          minDistance = distance;
          closestQuestion = q;
        }
      }
  
      return res.status(200).json({ answer: closestQuestion.answer });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };