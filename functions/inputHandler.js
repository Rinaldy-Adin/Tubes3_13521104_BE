// Import modules
const { addQuestion, deleteQuestion, getAnswer } = require('./CRUD');

// Connect to the database
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.on('connection', (stream) => {
    console.log('Connected!');
  });

// Regex for math expression
const mathRegex =
    /\(*\s*(\d+(.\d+)?)\s*(\(*\s*[\+\-\*\/\^]\s*((\d+(.\d+)?)|\)+|\(+)*)+/;

// Regex for date
const dateRegex = /(?<![+\-*\/\^.\d])\b\d+\/\d+\/\d+\b(?![\+\-\*\/\^\(\)])/;

// Regex for add question command
const addQuestionKeywordRegex = /tambah(kan)?\s*pertanyaan/i;
const addQuestionRegex =
    /tambah(kan)?\s*pertanyaan\s*"([^"]+)"\s*dengan\s*jawaban\s*"([^"]+)"/i;

// Regex for delete question command
const deleteQuestionKeywordRegex = /hapus\s*pertanyaan/i;
const deleteQuestionRegex = /hapus\s*pertanyaan\s*"([^"]+)"/i;

// Validate date
function validateDate(date) {
    const dateArray = date.split('/');
    if (dateArray.length !== 3) {
        return false;
    }

    const day = parseInt(dateArray[0]);
    const month = parseInt(dateArray[1]);
    const year = parseInt(dateArray[2]);

    if (
        day < 1 ||
        (day > 30 &&
            (month === 4 || month === 6 || month === 9 || month === 11)) ||
        (day > 31 &&
            (month === 1 ||
                month === 3 ||
                month === 5 ||
                month === 7 ||
                month === 8 ||
                month === 10 ||
                month === 12))
    ) {
        return false;
    }

    if (month < 1 || month > 12) {
        return false;
    }

    if (year < 0) {
        return false;
    }

    return true;
}

// Classify day of the week
function classifyDay(day) {
    switch (day) {
        case 0:
            return 'Sunday';
        case 1:
            return 'Monday';
        case 2:
            return 'Tuesday';
        case 3:
            return 'Wednesday';
        case 4:
            return 'Thursday';
        case 5:
            return 'Friday';
        case 6:
            return 'Saturday';
        default:
            return 'Invalid day';
    }
}

// Validate math expression
function validateMathExpression(str) {
    // Remove all characters except +, -, *, /, ^, (, ) and digits
    str = str.replace(/[^\d+\-*/^()]/g, '');

    // Check if parentheses are balanced
    let parenthesesCount = 0;
    for (let i = 0; i < str.length; i++) {
        if (str[i] === '(') {
            parenthesesCount++;
        } else if (str[i] === ')') {
            parenthesesCount--;
        }

        if (parenthesesCount < 0) {
            return false;
        }
    }
    if (parenthesesCount !== 0) {
        return false;
    }

    // Check if digits are followed by operators, and operators are followed by digits or parentheses
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        const nextChar = str[i + 1];

        if (/\d\s*/.test(char)) {
            if (
                /[\+\-\*\/\^\(\)]|\d/.test(nextChar) ||
                nextChar === undefined
            ) {
                continue;
            } else {
                return false;
            }
        }

        if (/[\+\-\*\/\^]\s*/.test(char)) {
            if (/\d|\(/.test(nextChar)) {
                continue;
            } else {
                return false;
            }
        }
    }

    return true;
}

// Evaluate math expression
function evaluateExpression(expression) {
    const operators = {
        '+': (a, b) => a + b,
        '-': (a, b) => a - b,
        '*': (a, b) => a * b,
        '/': (a, b) => a / b,
        '^': (a, b) => Math.pow(a, b),
    };

    const precedence = {
        '+': 1,
        '-': 1,
        '*': 2,
        '/': 2,
        '^': 3,
        '(': 0,
    };

    const outputQueue = [];
    const operatorStack = [];

    expression = expression.replace(/\s+/g, '');

    const tokens = expression.split(/([+\-*/^()])/);

    tokens.forEach((token) => {
        if (!token) {
            return;
        }

        if (/\d+/.test(token)) {
            outputQueue.push(parseFloat(token));
        } else if (token in operators) {
            while (
                operatorStack.length &&
                precedence[operatorStack[operatorStack.length - 1]] >=
                    precedence[token]
            ) {
                outputQueue.push(operatorStack.pop());
            }

            operatorStack.push(token);
        } else if (token === '(') {
            operatorStack.push(token);
        } else if (token === ')') {
            while (operatorStack[operatorStack.length - 1] !== '(') {
                outputQueue.push(operatorStack.pop());
            }

            operatorStack.pop();
        }
    });

    while (operatorStack.length) {
        outputQueue.push(operatorStack.pop());
    }

    const operandStack = [];

    outputQueue.forEach((token) => {
        if (typeof token === 'number') {
            operandStack.push(token);
        } else {
            const b = operandStack.pop();
            const a = operandStack.pop();

            operandStack.push(operators[token](a, b));
        }
    });

    return operandStack.pop();
}

// Classify user input into the appropriate category
function classifyInput(input) {
    classArray = [0, 0, 0, 0];

    if (addQuestionRegex.test(input)) {
        classArray[0] = 1;
    }

    if (deleteQuestionRegex.test(input)) {
        classArray[1] = 1;
    }

    if (dateRegex.test(input)) {
        classArray[2] = 1;
    }

    if (mathRegex.test(input)) {
        classArray[3] = 1;
    }

    return classArray;
}

function parseAddQuestionRegex(text) {
    const match = text.match(addQuestionRegex);
    if (match) {
        const question = match[2].trim();
        const answer = match[3].trim();
        if (question && answer) {
            return {
                question,
                answer
            };
        }
    }
    return null;
}

function parseDeleteQuestionRegex(input) {
    const match = input.match(deleteQuestionRegex);
    if (!match) {
        return null;
    }
    return match[1].trim();
}

// Create a function to handle user input
async function handleInput(input, algoType) {
    // Classify user input
    const category = classifyInput(input);
	let answers = [];

    if (
        category[0] === 0 &&
        category[1] === 0 &&
        category[2] === 0 &&
        category[3] === 0
    ) {
        // Return if the query resembles add or delete question keywords
        if (input.match(addQuestionKeywordRegex) || input.match(deleteQuestionKeywordRegex)) {
            answers.push('Invalid command to add or delete questions. Please follow the format `Tambahkan pertanyaan \"<question>\" dengan jawaban \"<answer>\"\` or `Hapus pertanyaan \"<question>\"`.');
            return answers;
        }

        // Get answer from algorithm
        const result = await getAnswer(input, algoType);

        // If the database is empty, return an error message
        if (result.error) {
            answers.push(result.error);
            return answers;
        }

        // If the question is not found, return similar questions
        if (result.similar) {
            const similarQuestions = "";
            for (let i = 0; i < result.error.length; i++) {
                similarQuestions += (i+1) + ". " + result.error[i].question + "\n";
            }
            answers.push('Question not found. Did you mean:\n' + similarQuestions);
            return answers;
        } else {
            answers.push(result.answer);
            // Delete the question from the input string if the question is found
            input = input.replace(result.question, '');
        }
    }

    for (let i = 0; i < category.length; i++) {
        if (category[i] === 1) {
            switch (i) {
                case 0:
                    let addQuestionMatch = input.match(addQuestionRegex)[0];
                    const questionToAdd = parseAddQuestionRegex(addQuestionMatch);
                    if (questionToAdd) {
                        addQuestion(questionToAdd.question, questionToAdd.answer);
                        answers.push('Question \"' + questionToAdd.question + '\" added.');
                    } else {
                        answers.push('Failed to parse add question command. Make sure question and answer are not empty.');
                    }
					break;
                case 1:
                    const questionToDelete = parseDeleteQuestionRegex(input);
                    if (questionToDelete) {
                        const deleteStatus = await deleteQuestion(questionToDelete, algoType);
                        if (deleteStatus.error) {
                            answers.push(deleteStatus.error);
                        } else {
                            answers.push('Question \"' + questionToDelete + '\" deleted.');
                        }
                    } else {
                        answers.push('Failed to parse delete question command.');
                    }
					break;
                case 2:
                    let dateMatch = input.match(dateRegex)[0];

                    // TODO: Handle multiple occurences of dates

                    // Validate and get the day of the week if date is valid
                    if (validateDate(dateMatch)) {
                        const dateArray = dateMatch.split('/');
                        const reformattedDate =
                            dateArray[2] +
                            '-' +
                            dateArray[1] +
                            '-' +
                            dateArray[0];
                        const day = new Date(reformattedDate).getDay();
                        answers.push("It's " + classifyDay(day) + '.');
                    } else {
                        answers.push('Please enter the date in the format DD/MM/YYYY.');
                    }

					break;
                case 3:
					// Delete the date from the input while it exists
					let temp = input;
					while (temp.match(dateRegex) != null) {
						temp = temp.replace(dateRegex, '');
					}

                    let mathExp = temp.match(mathRegex)[0];
					
                    // TODO: Handle multiple occurences of math expressions

                    // Validate and calculate the result of the math expression if it is valid
                    if (validateMathExpression(mathExp)) {
                        answers.push(
                            'The result is ' + evaluateExpression(mathExp) + '.'
                        );
                    } else {
                        answers.push('Please enter a valid math expression.');
                    }

					break;
            }
        }
    }

	return answers;
}

// Tester program
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

readline.question('Enter your input: ', async (input) => {
    let ans = await handleInput(input.toLowerCase(), 'KMP');
	for (let i = 0; i < ans.length; i++) {
		console.log(ans[i]);
	}
    readline.close();
});

module.exports = handleInput;