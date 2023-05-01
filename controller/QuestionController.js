const Question = require('../models/Question');
const { kmp, boyerMoore, levenshteinDistance } = require('../functions/stringMatching');

// Defaults to KMP
let algoUsed = 'KMP';

const exports = module.exports = {};

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
exports.deleteQuestionById = (req, res) => {
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

// Delete question by string matching
exports.deleteQuestionByStringMatching = async (req, res) => {
    const { input } = req.body;

    try {
        // Find exact match using KMP or Boyer-Moore
		let index;
        const questions = await Question.find();
        if (algoUsed === 'KMP') {
            index = kmp(questions, input);
        } else if (algoUsed === 'BM') {
            index = boyerMoore(questions, input);
        }
        if (index !== -1) {
            // Delete question
            const id = questions[index]._id;
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
        } else {
            // Find approximate match using Levenshtein Distance
            let minDistance = Infinity;
            let index = -1;
            for (let i = 0; i < questions.length; i++) {
                const distance = levenshteinDistance(input, questions[i].question);
                if (distance < minDistance) {
                    minDistance = distance;
                    index = i;
                }
            }
            if (index !== -1) {
                // Delete question
                const id = questions[index]._id;
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
            } else {
                return res.status(404).json({ message: 'Question not found' });
            }
        }
        return res.status(200).json({ message: 'Question deleted successfully' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
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
exports.getAnswerForQuestion = async (req, res) => {
    const { input } = req.body;
  
    try {
      // Find exact match using KMP or Boyer-Moore
      const questions = await Question.find();
      if (algoUsed === 'KMP') {
        let exactMatches = questions.filter(q => kmp(q.question, input) !== -1);
      } else if (algoUsed === 'BM') {
        let exactMatches = questions.filter(q => boyerMoore(q.question, input) !== -1);
      }
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

module.exports = exports;