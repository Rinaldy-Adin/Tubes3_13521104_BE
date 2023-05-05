// Input preprocessors

// Regex for add question command
const addQuestionRegex = /tambah(kan)?\s*pertanyaan\s*"([^"]+)"\s*dengan\s*jawaban\s*"([^"]+)"/i;

// Regex for delete question command
const deleteQuestionRegex = /hapus\s*pertanyaan\s*"([^"]+)"/i;

function tokenizeString(str) {
    const delimiterRegex = /\n/ig;
    const tokens = str.split(delimiterRegex).filter(token => token.trim() !== '');
    console.log(tokens);
    
    return tokens;
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

module.exports = {
    tokenizeString,
    parseAddQuestionRegex,
    parseDeleteQuestionRegex
};