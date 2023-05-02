// CRUD for the database

// Import the Question model
const Question = require('../models/Question');

// Import string matching algorithms
const { kmp, boyerMoore, levenshteinDistance } = require('./stringMatching');

// Add a question to the database
function addQuestion(question, answer) {
    const newQuestion = new Question({
        question,
        answer
    });

    newQuestion.save().then((err) => {
        if (err) {
            return {
                error: "Could not save question to database"
            };
        }
        return {
            message: "Question added successfully"
        };
    });
}

// Delete a question from the database
async function deleteQuestion(question, algoType) {
    // Find exact match using KMP or Boyer-Moore
    let index = -1;
    const questions = await Question.find();

    // Check if database is empty
    if (questions.length === 0) {
        return {
            error: "Database is empty"
        };
    }

    if (algoType === 'KMP') {
        for (let i = 0; i < questions.length; i++) {
            if (kmp(questions[i].question, question) !== -1) {
                index = i;
                break;
            }
        }
    } else if (algoType === 'BM') {
        for (let i = 0; i < questions.length; i++) {
            if (boyerMoore(questions[i].question, question) !== -1) {
                index = i;
                break;
            }
        }
    }

    if (index !== -1) {
        // Delete question
        const id = questions[index]._id;
        try {
            await Question.findByIdAndDelete(id);
            return {
                message: "Question deleted successfully"
            };
        } catch (err) {
            return {
                error: "Could not delete question from database"
            };
        }
    } else {
        return {
            error: "Could not find question in the database"
        };
    }
}

// Get the answer by string matching
async function getAnswer(question, algoType) {
    // Find exact match using KMP or Boyer-Moore
    let index = -1;
    const questions = await Question.find();

    // Check if database is empty
    if (questions.length === 0) {
        return {
            error: "Database is empty"
        };
    }

    if (algoType === 'KMP') {
        for (let i = 0; i < questions.length; i++) {
            if (kmp(questions[i].question, question) !== -1) {
                index = i;
                break;
            }
        }
    } else if (algoType === 'BM') {
        for (let i = 0; i < questions.length; i++) {
            if (boyerMoore(questions[i].question, question) !== -1) {
                index = i;
                break;
            }
        }
    }

    if (index === -1 || !questions[index] || !questions[index].answer) {
        // Find approximate match using Levenshtein distance
        const questionDistances = [];
        let minDistance;
        let minIndex;
        for (let i = 0; i < questions.length; i++) {
            const distance = levenshteinDistance(questions[i].question, question);
            questionDistances.push({question: questions[i].question, distance: distance});
            if (minDistance == undefined || distance < minDistance) {
                minDistance = distance;
                minIndex = i;
            }
        }
        
        const maxLength = Math.max(questions[minIndex].question.length, question.length);
        const similarity = ((maxLength - minDistance) / maxLength);

        if (similarity >= 0.9 || (minDistance <= 3 && questions[minIndex].question.length > 5)) {
            index = minIndex;
        } else {
            // Return a list of three most similar questions
            questionDistances.sort((a, b) => {
                return a.distance - b.distance;
            });
            const similarQuestions = [];
            let similarLen = questionDistances.length > 3 ? 3 : questionDistances.length;
            for (let i = 0; i < similarLen; i++) {
                similarQuestions.push(questionDistances[i].question);
            }
            return {
                similar: similarQuestions
            };
        }
    } else {
        // Get answer
        return {
            answer: questions[index].answer
        };
    }
}

module.exports = {
    addQuestion,
    deleteQuestion,
    getAnswer
};