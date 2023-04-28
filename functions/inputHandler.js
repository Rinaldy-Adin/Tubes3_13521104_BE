// Input classifiers

// Regex for math expression
const mathRegex = /\b\d+(\.\d+)?\s*([-+*/^]\s*\d+(\.\d+)?\s*)+\b/i;

// Regex for date
const dateRegex = /\b(\d\d|\d)\s*\/\s*(\d\d|\d)\s*\/\s*\d\d\d\d\b/;

// Regex for add question command
const addQuestionRegex = /\btambahkan\s*pertanyaan\s*(.+)\s*dengan\s*jawaban\s*(.+)\b/i;

// Regex for delete question command
const deleteQuestionRegex = /\bhapus\s*pertanyaan\s*(.+)\b/i;

// Levensthein distance to calculate similarity of strings
function levenshteinDistance(str1, str2) {
	const m = str1.length;
	const n = str2.length;
	const dp = Array.from({ length: m + 1 }, () =>
		Array.from({ length: n + 1 }, () => 0)
	);

	for (let i = 0; i <= m; i++) {
		dp[i][0] = i;
	}

	for (let j = 0; j <= n; j++) {
		dp[0][j] = j;
	}

	for (let i = 1; i <= m; i++) {
		for (let j = 1; j <= n; j++) {
			if (str1[i - 1] === str2[j - 1]) {
				dp[i][j] = dp[i - 1][j - 1];
			} else {
				dp[i][j] = 1 + Math.min(
						dp[i - 1][j],
						dp[i][j - 1],
						dp[i - 1][j - 1]
					);
			}
		}
	}

	return dp[m][n];
}

// Calculate the levenshtein distance of each question in the MongoDB database
function calculateQuestionSimilarity(questions) {
	const levenstheinArray = [];
	for (let i = 0; i < questions.length; i++) {
		levenstheinArray.push(levenshteinDistance(questions[i].question, input));
	}
	return levenstheinArray;
}

// Validate date
function validateDate(date) {
	const dateArray = date.split("/");
	const day = parseInt(dateArray[0]);
	const month = parseInt(dateArray[1]);
	const year = parseInt(dateArray[2]);

	if (day < 1 || day > 31) {
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
			return "Sunday";
		case 1:
			return "Monday";
		case 2:
			return "Tuesday";
		case 3:
			return "Wednesday";
		case 4:
			return "Thursday";
		case 5:
			return "Friday";
		case 6:
			return "Saturday";
		default:
			return "Invalid day";
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

		// TODO: Handle case with whitespace between two numbers

		// if (/\d/.test(char)) {
		// 	if (/[+\-*/^)]/.test(nextChar) || nextChar === undefined) {
		// 		continue;
		// 	} else {
		// 		return false;
		// 	}
		// }
	
		if (/[+\-*/^]/.test(char)) {
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
	  	'^': (a, b) => Math.pow(a, b)
	};
  
	const precedence = {
	  	'+': 1,
	  	'-': 1,
	  	'*': 2,
	  	'/': 2,
	  	'^': 3,
	  	'(': 0
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
			while (operatorStack.length && precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]) {
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

	classArray = [0, 0, 0, 0]

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
function handleInput(input) {
	// Classify user input
	const category = classifyInput(input);

	// TODO: Find exact match in database to prioritize answering
	if (category[0] === 0 && category[1] === 0 && category[2] === 0 && category[3] === 0) {
		console.log("Check database for questions.");
		return;
	}

	for (let i = 0; i < category.length; i++) {
		if (category[i] === 1) {
			switch (i) {
				case 0:
					console.log("You entered an add question command.");
					break;
				case 1:
					console.log("You entered a delete question command.");
					break;
				case 2:
					let dateMatch = input.match(dateRegex)[0];

					// TODO: Handle multiple occurences of dates

					// Validate and get the day of the week if date is valid
					if (validateDate(dateMatch)) {
						const dateArray = dateMatch.split("/");
						const reformattedDate = dateArray[2] + "-" + dateArray[1] + "-" + dateArray[0];
						const day = new Date(reformattedDate).getDay();
						console.log("It's " + classifyDay(day) + ".");
					} else {
						console.log("Please enter the date in the format DD/MM/YYYY.");
					}

					break;
				case 3:
					// Does not calculate the result of the math expression if it resembles a date
					if (dateRegex.test(input)) {
						break;
					}

					// TODO: Handle multiple occurences of math expressions

					let mathExp = input.match(mathRegex)[0];

					// Validate and calculate the result of the math expression if it is valid
					if (validateMathExpression(mathExp)) {
						console.log("The result is " + evaluateExpression(mathExp) + ".");
					} else {
						console.log("Invalid math expression.");
					}

					break;
			}
		}
	}
}

// Tester program
const readline = require("readline").createInterface({
	input: process.stdin,
	output: process.stdout
});

readline.question("Enter your input: ", input => {
	handleInput(input.toLowerCase());
	readline.close();
})