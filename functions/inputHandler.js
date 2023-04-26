// Input classifiers

// Regex for calculator expression
const mathRegex = /\b\d+(\.\d+)?\s*([-+*/^]\s*\d+(\.\d+)?\s*)+\b/

// Regex for date
const dateRegex = /\d\/\d\/\d/;

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
					console.log("You entered a date.");
					break;
				case 3:
					console.log("You entered a math expression. ");
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