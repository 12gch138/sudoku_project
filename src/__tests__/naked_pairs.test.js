import { naked_pairs_strategy } from '@sudoku/strategy/naked_pairs';
import { stringToMatrix } from './test-utils';

describe('Naked Pairs Strategy Tests', () => {
    test('should correctly identify and remove candidates for naked pairs in box', () => {
        // 该测例包含一个宫格中的naked pair
        const input = [
            [0,0,0,1,4,6,0,0,0], 
            [4,6,1,0,0,2,7,5,8],
            [2,3,9,7,8,5,0,0,0],
            [9,0,5,2,6,3,0,8,7],
            [3,7,6,8,1,4,9,2,5],
            [8,0,0,0,0,7,6,0,0],
            [1,0,0,6,0,9,8,4,0], 
            [6,9,3,4,0,8,5,0,0],
            [0,0,0,0,0,1,0,0,0]
        ];

        const candidates = naked_pairs_strategy.get_candidate(input);

        // 验证宫9的3和7两个位置是否只包含2和3
        expect(candidates[6][8].sort()).toEqual([2,3]);
        expect(candidates[8][6].sort()).toEqual([2,3]);

        // 验证宫9的其他位置是否已移除2和3
        expect(candidates[8][8]).not.toContain(2);
        expect(candidates[8][8]).not.toContain(3);
        expect(candidates[8][7]).not.toContain(2);
        expect(candidates[8][7]).not.toContain(3);
    });

    test.skip('should correctly identify and remove candidates for naked pairs in column', () => {
        // 这个数独谜题包含一个列中的naked pair
        const input = stringToMatrix(
            "000000000" +
            "000000000" +
            "300000000" +
            "000000000" +
            "000000000" +
            "000000000" +
            "000000000" +
            "000000000" +
            "000000000"
        );

        const candidates = naked_pairs_strategy.get_candidate(input);

        // 验证特定位置的候选数
        // 假设第一列的[0,0]和[1,0]位置形成naked pair {4,7}
        expect(candidates[0][0].sort()).toEqual([4,7]);
        expect(candidates[1][0].sort()).toEqual([4,7]);

        // 验证同列其他位置是否已移除这些候选数
        for (let row = 2; row < 9; row++) {
            if (row !== 2) { // 跳过已填数字的位置
                expect(candidates[row][0]).not.toContain(4);
                expect(candidates[row][0]).not.toContain(7);
            }
        }
    });
/*
    test('should correctly identify and remove candidates for naked pairs in box', () => {
        // 这个数独谜题包含一个3x3宫格中的naked pair
        const input = stringToMatrix(
            "000000000" +
            "000000000" +
            "000000000" +
            "000000000" +
            "000000000" +
            "000000000" +
            "000000000" +
            "000000000" +
            "000000000"
        );

        const candidates = naked_pairs_strategy.get_candidate(input);

        // 验证第一个3x3宫格中的naked pair
        // 假设[0,0]和[0,1]位置形成naked pair {2,5}
        expect(candidates[0][0].sort()).toEqual([2,5]);
        expect(candidates[0][1].sort()).toEqual([2,5]);

        // 验证同一宫格内其他位置是否已移除这些候选数
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (!((row === 0 && col === 0) || (row === 0 && col === 1))) {
                    expect(candidates[row][col]).not.toContain(2);
                    expect(candidates[row][col]).not.toContain(5);
                }
            }
        }
    });
*/
    test('performance test for naked pairs strategy', () => {
        const input = stringToMatrix(
            "000000000" +
            "000000000" +
            "300000000" +
            "000000000" +
            "000000000" +
            "000000000" +
            "000000000" +
            "000000000" +
            "000000000"
        );

        const startTime = performance.now();
        for (let i = 0; i < 1000; i++) {
            naked_pairs_strategy.get_candidate(input);
        }
        const endTime = performance.now();
        
        console.log(`Naked pairs strategy execution time: ${endTime - startTime}ms for 1000 iterations`);
        expect(endTime - startTime).toBeLessThan(5000); // 确保1000次迭代在5秒内完成
    });
}); 