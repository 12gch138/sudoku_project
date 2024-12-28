import { manager } from '@sudoku/strategy/strategy_manager.js';
import { stringToMatrix } from './test-utils.js';
import { testCases } from './test-data.js';

describe('Multi Strategy Tests', () => {
    test('multi strategy', () => {
        const matrix = stringToMatrix(testCases.simple);
        const candidates = manager.executeStrategies(matrix);
        expect(candidates).toBeDefined();
        expect(Array.isArray(candidates)).toBe(true);
    });

    test('x_wing strategy', () => {
        const matrix = stringToMatrix(testCases.x_wing);
        const candidates = manager.executeStrategies(matrix);
        expect(candidates).toBeDefined();
        expect(Array.isArray(candidates)).toBe(true);
    });
});