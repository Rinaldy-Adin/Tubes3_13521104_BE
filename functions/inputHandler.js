// Import modules
const { addQuestion, deleteQuestion, getAnswer } = require('./CRUD');
const { tokenizeString, parseAddQuestionRegex, parseDeleteQuestionRegex } = require('./preprocessor');

// Regex for math expression
const mathRegex =
    /\(*\s*(\d+(.\d+)?)\s*(\(*\s*[\+\-\*\/\^]\s*((\d+(.\d+)?)|\)+|\(+)*)+/;

// Regex for date
const dateRegex = /(?<![+\-*\/\^.\d])\b\d+\/\d+\/\d+\b(?![\+\-\*\/\^\(\)])/;

// Regex for add question command
const addQuestionKeywordRegex = /tambah(kan)?\s*pertanyaan/i;
const addQuestionRegex = /tambah(kan)?\s*pertanyaan\s*"([^"]+)"\s*dengan\s*jawaban\s*"([^"]+)"/i;

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

// Create a function to handle user input
async function handleInput(input, algoType) {
    // Initialize the answers array
    let answers = [];

    // Return if the input does not contain a valid delimiter
    if (!input.match(/[;?]/)) {
        answers.push('Please include delimiters such as `;` or `?` in your query.');
        return answers;
    }

    // Tokenize the input
    const tokens = tokenizeString(input);

    // Iterate through the tokens
    for (const token of tokens) {
        // Classify the token
        let category = classifyInput(token);

        // Skip if the query resembles add or delete question keywords but does not follow the format
        if ((token.match(addQuestionKeywordRegex) && !token.match(addQuestionRegex)) || (token.match(deleteQuestionKeywordRegex)) && !token.match(deleteQuestionRegex)) {
            answers.push('Invalid command to add or delete questions. Please follow the format `Tambahkan pertanyaan \"<question>\" dengan jawaban \"<answer>\"\` or `Hapus pertanyaan \"<question>\"`.');
            continue;
        }

        // Look for questions in the database if it does not resemble any special features
        if (
            category[0] === 0 &&
            category[1] === 0 &&
            category[2] === 0 &&
            category[3] === 0
        ) {
            // Get answer from algorithm
            const result = await getAnswer(token, algoType);
        
            // If the database is empty, push an error message
            if (result.error) {
                answers.push(result.error);
                continue;
            }
        
            // If the question is not found, return similar questions
            if (result.similar) {
                let similarQuestions = "";
                for (let i = 0; i < result.similar.length; i++) {
                    similarQuestions += (i+1) + ". " + result.similar[i];
                    if (i !== result.similar.length - 1) {
                        similarQuestions += "\n";
                    }
                }
                answers.push('Question not found. Did you mean:\n' + similarQuestions);
                continue;
            } else {
                answers.push(result.answer);
                continue;
            }
        }
    
        // Otherwise, check if the token is a command
        for (let i = 0; i < category.length; i++) {
            if (category[i] === 1) {
                switch (i) {
                    case 0:
                        let addQuestionMatch = token.match(addQuestionRegex)[0];
                        const questionToAdd = parseAddQuestionRegex(addQuestionMatch);

                        // Check if the question to add resembles a special feature
                        if (questionToAdd.question.match(addQuestionKeywordRegex) || 
                            questionToAdd.question.match(deleteQuestionKeywordRegex) ||
                            questionToAdd.question.match(dateRegex) ||
                            questionToAdd.question.match(mathRegex)) {
                                answers.push('Invalid question to add. Please exclude dates, math expressions, and add/delete question keywords.');
                                break;
                            }

                        // Add the question to the database
                        if (questionToAdd) {
                            const addQ = await addQuestion(questionToAdd.question, questionToAdd.answer, algoType);
                            if (addQ.error) {
                                // If error occurs, push an error message
                                answers.push(addQ.error);
                            } else {
                                answers.push(addQ.message);
                            }
                        } else {
                            answers.push('Failed to parse add question command. Make sure question and answer is not empty.');
                        }

                        break;
                    case 1:
                        const questionToDelete = parseDeleteQuestionRegex(token);
                        if (questionToDelete) {
                            const deleteStatus = await deleteQuestion(questionToDelete, algoType);
                            if (deleteStatus.error) {
                                // If the database is empty or question is not found, push an error message
                                answers.push(deleteStatus.error);
                            } else {
                                answers.push('Question \"' + questionToDelete + '\" successfully deleted.');
                            }
                        } else {
                            answers.push('Failed to parse delete question command. Please follow the format `Hapus pertanyaan \"<question>\"`.');
                        }

                        break;
                    case 2:
                        let dateMatch = token.match(dateRegex)[0];
    
                        // Get the day of the week if date is valid
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
                        // Delete the date from the token while it exists to avoid confliction with math expression
                        let temp = token;
                        while (temp.match(dateRegex) != null) {
                            temp = temp.replace(dateRegex, '');
                        }

                        // If the remaining string does not contain any math expression, continue
                        if (temp.match(mathRegex) == null) {
                            continue;
                        }

                        let mathExp = temp.match(mathRegex)[0];
    
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
    }

	return answers;
}

// Tester program
// const readline = require('readline').createInterface({
//     input: process.stdin,
//     output: process.stdout,
// });

// readline.question('Enter your input: ', async (input) => {
//     let ans = await handleInput(input.toLowerCase(), 'KMP');
// 	for (let i = 0; i < ans.length; i++) {
// 		console.log(ans[i]);
// 	}
//     readline.close();
// });

module.exports = handleInput;