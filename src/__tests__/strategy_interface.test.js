import { Strategy } from '@sudoku/strategy/strategy';
import { basic_strategy } from '@sudoku/strategy/basic';

describe('Strategy Interface Tests', () => {
    // 验证构造函数参数
    test('constructor should properly set strategy name', () => {
        class TestStrategy extends Strategy {
            get_candidate(board) { return []; }
        }
        
        const strategyName = "Test Strategy";
        const strategy = new TestStrategy(strategyName);
        expect(strategy.name).toBe(strategyName);
    });

    // 测试抽象方法实现
    test('should throw error when instantiating abstract Strategy class', () => {
        expect(() => {
            new Strategy("Abstract Strategy");
        }).toThrow('Abstract classes can\'t be instantiated.');
    });

    // 验证返回值格式
    test('get_candidate should return correct format', () => {
        const board = Array(9).fill().map(() => Array(9).fill(0));
        const candidates = basic_strategy.get_candidate(board);
        
        // 验证返回值格式
        expect(Array.isArray(candidates)).toBe(true);
        expect(candidates.length).toBe(9);
        expect(Array.isArray(candidates[0])).toBe(true);
        expect(Array.isArray(candidates[0][0])).toBe(true);
        
        // 验证候选数值范围
        candidates.forEach(row => {
            row.forEach(cell => {
                cell.forEach(num => {
                    expect(num).toBeGreaterThanOrEqual(1);
                    expect(num).toBeLessThanOrEqual(9);
                });
            });
        });
    });
}); 