// String matching algorithms

/**
 * @abstract KMP algorithm
 * @param {string} text
 * @param {string} pattern
 * @returns {number} index of the first match
 * 
 */
function kmp(text, pattern) {
    let i = 0;
    let j = 0;
    const prefix = computePrefix(pattern);
    while (i < text.length) {
        if (text[i] === pattern[j]) {
            if (j === pattern.length - 1) {
                return i - j;
            }
            i++;
            j++;
        } else if (j > 0) {
            j = prefix[j - 1];
        } else {
            i++;
        }
    }
    return -1;
}

/**
 * @abstract Compute prefix array
 * @param {string} pattern
 * @returns {number[]} prefix array
 * 
*/
function computePrefix(pattern) {
    const prefix = new Array(pattern.length).fill(0);
    let i = 1;
    let j = 0;
    while (i < pattern.length) {
        if (pattern[i] === pattern[j]) {
            prefix[i] = j + 1;
            i++;
            j++;
        } else if (j > 0) {
            j = prefix[j - 1];
        } else {
            i++;
        }
    }
    return prefix;
}

/**
 * @abstract Boyer-Moore algorithm
 * @param {string} text
 * @param {string} pattern
 * @returns {number} index of the first match
 * 
 */

function boyerMoore(text, pattern) {
    const last = buildLast(pattern);
    let i = pattern.length - 1;
    let j = pattern.length - 1;
    while (i < text.length) {
        if (text[i] === pattern[j]) {
            if (j === 0) {
                return i;
            }
            i--;
            j--;
        } else {
            i += pattern.length - Math.min(j, 1 + last[text[i].charCodeAt(0)]);
            j = pattern.length - 1;
        }
    }
    return -1;
}

/**
 * @abstract Build last object
 * @param {string} pattern
 * @returns {object} last object
 * 
*/
function buildLast(pattern) {
    const last = {};
    for (let i = 0; i < pattern.length; i++) {
        last[pattern[i].charCodeAt(0)] = i;
    }
    return last;
}

// Tester program
const text = "ababababca";
const pattern = "babc";
console.log(kmp(text, pattern));
console.log(boyerMoore(text, pattern));