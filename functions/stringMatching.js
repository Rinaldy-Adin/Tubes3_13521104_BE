// String matching algorithms

/**
 * Levenshtein distance
 * @param {string} str1 
 * @param {string} str2 
 * @returns {number} Edit distance between str1 and str2
 */
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
                dp[i][j] =
                    1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
            }
        }
    }

    return dp[m][n];
}

/**
 * KMP algorithm
 * @param {string} text
 * @param {string} pattern
 * @returns {number} index of the first match
 * 
 */
function kmp(text, pattern) {
    if (text.length != pattern.length) {
        return -1;
    }

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
 * Compute prefix array
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
 * Boyer-Moore algorithm
 * @param {string} text
 * @param {string} pattern
 * @returns {number} index of the first match
 * 
 */
function boyerMoore(text, pattern) {
    if (text.length != pattern.length) {
        return -1;
    }

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
 * Build last object
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

module.exports = {
    levenshteinDistance,
    kmp,
    boyerMoore
};

// Tester program
// const text = "ababababca";
// const pattern = "babc";
// console.log(kmp(text, pattern));
// console.log(boyerMoore(text, pattern));