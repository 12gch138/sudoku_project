/**
 * 将81字符的数独字符串转换为9x9的矩阵
 * @param {string} str - 81个字符的数独字符串
 * @returns {number[][]} 9x9的数独矩阵
 */
export function stringToMatrix(str) {
    if (str.length !== 81) {
        throw new Error('输入字符串长度必须为81');
    }

    const matrix = [];
    for (let i = 0; i < 9; i++) {
        matrix[i] = [];
        for (let j = 0; j < 9; j++) {
            matrix[i][j] = parseInt(str[i * 9 + j]);
        }
    }
    return matrix;
}

/**
 * 将9x9的数独矩阵转换为81字符的字符串
 * @param {number[][]} matrix - 9x9的数独矩阵
 * @returns {string} 81个字符的数独字符串
 */
export function matrixToString(matrix) {
    return matrix.flat().join('');
}

/**
 * 检查数独是否已完成
 * @param {number[][]} board - 数独矩阵
 * @returns {boolean | {error: string, position: string}}
 */
export function isComplete(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                return {
                    error: 'Incomplete board',
                    position: `Empty cell at row: ${row + 1}, col: ${col + 1}`
                };
            }
        }
    }
    return true;
}

/**
 * 检查当前数独状态是否正确
 * @param {number[][]} board - 数独矩阵
 * @returns {boolean | {error: string, position: string}} 如果正确返回true，否则返回错误信息
 */
export function isCorrectSoFar(board) {
    // 检查行
    for (let row = 0; row < 9; row++) {
        const seen = new Set();
        for (let col = 0; col < 9; col++) {
            const value = board[row][col];
            if (value !== 0) {
                if (seen.has(value)) {
                    return {
                        error: `Duplicate value ${value} in row ${row + 1}`,
                        position: `row: ${row + 1}, col: ${col + 1}`
                    };
                }
                seen.add(value);
            }
        }
    }

    // 检查列
    for (let col = 0; col < 9; col++) {
        const seen = new Set();
        for (let row = 0; row < 9; row++) {
            const value = board[row][col];
            if (value !== 0) {
                if (seen.has(value)) {
                    return {
                        error: `Duplicate value ${value} in column ${col + 1}`,
                        position: `row: ${row + 1}, col: ${col + 1}`
                    };
                }
                seen.add(value);
            }
        }
    }

    // 检查九宫格
    for (let box = 0; box < 9; box++) {
        const seen = new Set();
        const boxRow = Math.floor(box / 3) * 3;
        const boxCol = (box % 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const value = board[boxRow + i][boxCol + j];
                if (value !== 0) {
                    if (seen.has(value)) {
                        return {
                            error: `Duplicate value ${value} in box ${box + 1}`,
                            position: `row: ${boxRow + i + 1}, col: ${boxCol + j + 1}`
                        };
                    }
                    seen.add(value);
                }
            }
        }
    }
    return true;
}

/**
 * 检查数独是否完成且正确
 * @param {number[][]} board - 数独矩阵
 * @returns {boolean | {error: string, position: string}}
 */
export function isCompleteAndCorrect(board) {
    const completeCheck = isComplete(board);
    if (completeCheck !== true) {
        return completeCheck;
    }
    
    const correctCheck = isCorrectSoFar(board);
    if (correctCheck !== true) {
        return correctCheck;
    }
    
    return true;
}

/**
 * 深拷贝数独矩阵
 * @param {number[][]} board - 数独矩阵
 * @returns {number[][]}
 */
export function cloneBoard(board) {
    return JSON.parse(JSON.stringify(board));
}


describe('Test Utils', () => {
    test('stringToMatrix should convert string to matrix correctly', () => {
        const str = "123456789".repeat(9);
        const matrix = stringToMatrix(str);
        expect(matrix.length).toBe(9);
        expect(matrix[0].length).toBe(9);
        expect(matrix[0][0]).toBe(1);
    });
}); 