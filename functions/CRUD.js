// CRUD for the database

// Import the Question model
const Question = require('../models/Question');

// Import string matching algorithms
const { kmp, boyerMoore, levenshteinDistance } = require('./stringMatching');

// Add a question to the database
async function addQuestion(question, answer, algoType) {

    // If the question already exists, update the answer
    const questions = await Question.find();
    for (let i = 0; i < questions.length; i++) {
        if (algoType === 'KMP') {
            if (kmp(questions[i].question, question) !== -1) {
                questions[i].answer = answer;
                const updateStatus = await questions[i].save();
                if (updateStatus) {
                    return {
                        message: "Question \"" + question + "\" already exists. Answer updated successfully."
                    };
                } else {
                    return {
                        error: "Could not update question in database."
                    };
                }
            }
        } else if (algoType === 'BM') {
            if (boyerMoore(questions[i].question, question) !== -1) {
                questions[i].answer = answer;
                const updateStatus = await questions[i].save();
                if (updateStatus) {
                    return {
                        message: "Question \"" + question + "\" already exists. Answer updated successfully."
                    };
                } else {
                    return {
                        error: "Could not update question in database."
                    };
                }
            }
        }
    }

    // If the question does not exist, add it to the database
    const newQuestion = new Question({
        question,
        answer
    });

    try {
        const saveStatus = await newQuestion.save();
        if (saveStatus) {
            return {
                message: "Question \"" + question + "\" added successfully."
            };
        } else {
            return {
                error: "Could not add question to database."
            };
        }
    } catch (err) {
        return {
            error: err
        };
    }
}

// Delete a question from the database
async function deleteQuestion(question, algoType) {
    // Find exact match using KMP or Boyer-Moore
    let index = -1;
    const questions = await Question.find();

    // Check if database is empty
    if (questions.length === 0) {
        return {
            error: "Database is empty."
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
                message: "Question deleted successfully."
            };
        } catch (err) {
            return {
                error: "Could not delete question from database."
            };
        }
    } else {
        return {
            error: "Could not find question in the database."
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
            error: "Database is empty."
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
        let questionDistances = [];
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
        
        // Filter out questions that are too different (similarity < 0.50)
        questionDistances = questionDistances.filter((questionDistance) => {
            let maxLength = Math.max(questionDistance.question.length, question.length);
            let similarity = ((maxLength - questionDistance.distance) / maxLength);
            return similarity >= 0.50;
        });

        // Return if no similar questions found
        if (questionDistances.length === 0) {
            return {
                error: "Could not find question in the database."
            };
        }

        const maxLength = Math.max(questions[minIndex].question.length, question.length);
        const similarity = ((maxLength - minDistance) / maxLength);

        console.log(questionDistances);

        // Return answer if similarity >= 0.90 or minDistance <= 3 and question length > 5
        if (similarity >= 0.90 || (minDistance <= 3 && questions[minIndex].question.length > 5)) {
            // Get answer
            return {
                answer: questions[minIndex].answer
            };
        } else {
            // Return a list of three most similar questions, if any
            questionDistances.sort((a, b) => {
                return a.distance - b.distance;
            });
            
            const similarQuestions = [];
            let similarLen = questionDistances.length > 3 ? 3 : questionDistances.length;
            for (let i = 0; i < similarLen; i++) {
                similarQuestions.push(questionDistances[i].question + "?");
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