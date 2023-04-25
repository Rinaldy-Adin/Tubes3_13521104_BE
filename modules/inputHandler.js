// Regular expressions

// Regex for calculator expression
const calculatorRegex = /^([+\-*\/^()]*\d+[+\-*\/^()]*)+$/;

// Regex for date in the format DD/MM/YYYY
const dateRegex = /\d{1,2}\/\d{1,2}\/\d{4}/;

// Regex for add question command
const addQuestionRegex = /tambahkan pertanyaan (.+) dengan jawaban (.+)/i;

// Regex for delete question command
const deleteQuestionRegex = /hapus pertanyaan (.+)/i;

// Classify user input into the appropriate category
function classifyInput(input) {
  if (addQuestionRegex.test(input)) {
    return 1;
  } else if (deleteQuestionRegex.test(input)) {
    return 2;
  } else if (dateRegex.test(input)) {
    return 3;
  } else if (calculatorRegex.test(input)) {
    return 4;
  } else {
    return 0;
  }
}

// Create a function to handle user input
function handleInput(input) {
    // Classify user input
    const category = classifyInput(input);
    
    // Handle user input based on the category
    switch (category) {
        case 1:
            console.log("You entered an add question command.");
            break;
        case 2:
            console.log("You entered a delete question command.");
            break;
        case 3:
            console.log("You entered a date.");
            break;
        case 4:
            console.log("You entered a calculator expression. ");
            break;
        default:
            console.log("Check database for questions.");
    }
}

// Tester program
// const readline = require("readline").createInterface({
//     input: process.stdin,
//     output: process.stdout
// });

// readline.question("Enter your input: ", input => {
//     handleInput(input);
//     readline.close();
// })