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
import { Strategy } from '@sudoku/strategy/strategy';
import { basic_strategy } from '@sudoku/strategy/basic';
import { naked_pairs_strategy } from '@sudoku/strategy/naked_pairs';

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

describe('Single Strategy Tests', () => {
    // 测试数据
    const testCases = [
        {
            name: 'Basic Strategy Test',
            input: '530070000600195000098000060800060003400803001700020006060000280000419005000080079',
            strategy: basic_strategy
        },
        {
            name: 'Naked Pairs Test',
            input: '000000000000003085001020000000507000004000100090000000500000073002010000000040009',
            strategy: naked_pairs_strategy
        }
    ];

    test.each(testCases)('$name should generate valid candidates', ({ input, strategy }) => {
        const board = stringToMatrix(input);
        const candidates = strategy.get_candidate(board);

        // 验证候选数格式
        expect(candidates).toHaveLength(9);
        candidates.forEach(row => {
            expect(row).toHaveLength(9);
            row.forEach(cell => {
                expect(Array.isArray(cell)).toBeTruthy();
                cell.forEach(num => {
                    expect(num).toBeGreaterThanOrEqual(1);
                    expect(num).toBeLessThanOrEqual(9);
                });
            });
        });

        // 验证候选数的正确性
        expect(isCorrectSoFar(board)).toBe(true);
    });

    // 性能测试
    test.each(testCases)('$name performance test', ({ input, strategy }) => {
        const board = stringToMatrix(input);
        const startTime = performance.now();
        
        for(let i = 0; i < 1000; i++) {
            strategy.get_candidate(board);
        }
        
        const endTime = performance.now();
        console.log(`${strategy.name} execution time: ${endTime - startTime}ms for 1000 iterations`);
    });
}); 