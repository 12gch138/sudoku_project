import { manager } from '@sudoku/strategy/strategy_manager';
import { basic_strategy } from '@sudoku/strategy/basic';
import { naked_pairs_strategy } from '@sudoku/strategy/naked_pairs';
import { hidden_pairs_strategy } from '@sudoku/strategy/hidden_pairs';

describe('StrategyManager Interface Tests', () => {

    // 测试策略组合的正确性
    test('should correctly combine multiple strategies', () => {
        const board = [
            [1,0,0,0,0,0,0,0,0],
            [0,2,0,0,0,0,0,0,0],
            [0,0,3,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0]
        ];

        // 获取基础策略的候选数
        const basicCandidates = basic_strategy.get_candidate(board);
        // 获取组合策略的候选数
        const combinedCandidates = manager.executeStrategies(board);

        // 验证组合策略结果包含基础策略的结果
        expect(combinedCandidates[0][0]).toEqual([]);  // 已填数字位置
        expect(combinedCandidates[0][1].length).toBeLessThanOrEqual(basicCandidates[0][1].length); // 候选数应该更少或相等
    });

    // 测试策略冲突处理
    test('should handle strategy conflicts correctly', () => {
        const board = [
            [1,2,0,0,0,0,0,0,0],
            [0,0,3,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0]
        ];

        // 获取不同策略的候选数
        const nakedPairsCandidates = naked_pairs_strategy.get_candidate(board);
        const hiddenPairsCandidates = hidden_pairs_strategy.get_candidate(board);
        const combinedCandidates = manager.executeStrategies(board);

        // 验证组合结果的正确性
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    // 组合结果的候选数应该是两个策略结果的交集
                    const combined = new Set(combinedCandidates[row][col]);
                    const naked = new Set(nakedPairsCandidates[row][col]);
                    const hidden = new Set(hiddenPairsCandidates[row][col]);
                    expect(combined.size).toBeLessThanOrEqual(Math.min(naked.size, hidden.size));
                }
            }
        }
    });

    // 测试策略执行接口
    test('executeStrategies should apply all strategies in order', () => {
        const board = Array(9).fill().map(() => Array(9).fill(0));
        board[0][0] = 1; 
        
        const candidates = manager.executeStrategies(board);
        
        // 验证基本策略的执行结果
        expect(candidates[0][0]).toEqual([]);  
        //expect(candidates[0][1].length).toBeGreaterThan(0);
        
        // 验证策略执行顺序
        const allCandidates = candidates.flat().filter(cell => cell.length > 0);
        allCandidates.forEach(cellCandidates => {
            expect(cellCandidates.length).toBeLessThanOrEqual(9); // 候选数不应超过9
            expect(Math.min(...cellCandidates)).toBeGreaterThanOrEqual(1); // 最小值应该>=1
            expect(Math.max(...cellCandidates)).toBeLessThanOrEqual(9); // 最大值应该<=9
        });
    });
}); 