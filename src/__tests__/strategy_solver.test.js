// 策略求解测试

import { manager } from '../node_modules/@sudoku/strategy/strategy_manager.js';
import { 
    stringToMatrix, 
    isComplete, 
    isCorrectSoFar, 
    isCompleteAndCorrect,
    cloneBoard 
} from './test-utils.js';
import { testCases } from './test-data.js';

// 多步推理求解函数
function solveWithStrategies(board) {
    let currentBoard = cloneBoard(board);
    let changed = true;
    let iterations = 0;
    const maxIterations = 100;

    while (changed && iterations < maxIterations) {
        changed = false;
        iterations++;

        console.log(`\nIteration ${iterations}:`);
        
        const candidates = manager.executeStrategies(currentBoard);
        
        // 检查是否有确定的值
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (currentBoard[row][col] === 0 && candidates[row][col].length === 1) {
                    const newValue = candidates[row][col][0];
                    console.log(`Setting value ${newValue} at position (${row + 1}, ${col + 1})`);
                    currentBoard[row][col] = newValue;
                    changed = true;
                }
            }
        }

        // 验证当前状态是否正确
        const validCheck = isCorrectSoFar(currentBoard);
        if (validCheck !== true) {
            console.error('\nInvalid board state detected:');
            console.error('Error:', validCheck.error);
            console.error('Position:', validCheck.position);
            console.error('\nCurrent board state:');
            console.error(currentBoard);
            throw new Error(`Invalid board state: ${validCheck.error} at ${validCheck.position}`);
        }
    }

    if (iterations >= maxIterations) {
        console.warn('Reached maximum iterations without solving the puzzle');
    }

    return currentBoard;
}

describe('Strategy Solver Tests', () => {
    test('Should solve simple sudoku puzzle', () => {
        const board = stringToMatrix(testCases.simple2);
        const solvedBoard = solveWithStrategies(board);
        //console.log(solvedBoard);
        expect(isCompleteAndCorrect(solvedBoard)).toBe(true);
    });

    test.skip('Should detect invalid board', () => {
        const invalidBoard = [
            [5,5,0,0,7,0,0,0,0], // 两个5在同一行
            [6,0,0,1,9,5,0,0,0],
            [0,9,8,0,0,0,0,6,0],
            [8,0,0,0,6,0,0,0,3],
            [4,0,0,8,0,3,0,0,1],
            [7,0,0,0,2,0,0,0,6],
            [0,6,0,0,0,0,2,8,0],
            [0,0,0,4,1,9,0,0,5],
            [0,0,0,0,8,0,0,7,9]
        ];

        expect(() => solveWithStrategies(invalidBoard)).toThrow();
    });

    test.skip('solve puzzle using all strategy', () => {
        const xWingBoard = stringToMatrix(testCases.x_wing);
        const solvedBoard = solveWithStrategies(xWingBoard);
        expect(isCompleteAndCorrect(solvedBoard)).toBe(true);
    });

    
}); 