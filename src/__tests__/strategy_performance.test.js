import { manager } from '@sudoku/strategy/strategy_manager';
import { basic_strategy } from '@sudoku/strategy/basic';
import { naked_pairs_strategy } from '@sudoku/strategy/naked_pairs';
import { naked_triple_strategy } from '@sudoku/strategy/naked_triple';
import { naked_quad_strategy } from '@sudoku/strategy/naked_quad';
import { hidden_pairs_strategy } from '@sudoku/strategy/hidden_pairs';
import { x_wing_strategy, swordfish_strategy, jellyfish_strategy } from '@sudoku/strategy/fish';
import { stringToMatrix } from './test-utils';
import { testCases } from './test-data';

describe('Strategy Performance Tests', () => {
    // 测试数据集
    const testBoards = {
        simple: testCases.simple,
        nakedPairs: testCases.naked_triple,
        complex: testCases.x_wing,
        fish: testCases.x_wing  // 专门用于测试fish策略的数据
    };

    // 单个策略性能测试
    const strategies = [
        { name: 'Basic Strategy', strategy: basic_strategy },
        { name: 'Naked Pairs', strategy: naked_pairs_strategy },
        { name: 'Naked Triple', strategy: naked_triple_strategy },
        { name: 'Naked Quad', strategy: naked_quad_strategy },
        { name: 'Hidden Pairs', strategy: hidden_pairs_strategy },
        { name: 'X Wing', strategy: x_wing_strategy},
        { name: 'Swordfish', strategy: swordfish_strategy},
        { name: 'Jellyfish', strategy: jellyfish_strategy}
    ];

            //x_wing_strategy,
            //swordfish_strategy,
            //jellyfish_strategy

    describe('Individual Strategy Performance', () => {
        test.each(strategies)('$name performance test', ({ strategy }) => {
            const results = {};
            
            // 对每个测试数据进行测试
            for (const [boardName, boardString] of Object.entries(testBoards)) {
                const board = stringToMatrix(boardString);
                
                const startTime = performance.now();
                for (let i = 0; i < 1000; i++) {
                    strategy.get_candidate(board);
                }
                const endTime = performance.now();
                
                const executionTime = endTime - startTime;
                results[boardName] = executionTime;
                
                console.log(`${strategy.name} on ${boardName}:`);
                console.log(`- Total time: ${executionTime.toFixed(2)}ms`);
                console.log(`- Average time per iteration: ${(executionTime / 1000).toFixed(3)}ms`);
            }

            // 验证性能是否在可接受范围内
            Object.values(results).forEach(time => {
                expect(time).toBeLessThan(5000); // 5秒内完成1000次迭代
            });
        });
    });

    describe('Strategy Manager Performance', () => {
        test('Combined strategies performance test', () => {
            const results = {};
            
            // 对每个测试数据进行测试
            for (const [boardName, boardString] of Object.entries(testBoards)) {
                const board = stringToMatrix(boardString);
                
                // 测试所有策略组合
                const startTime = performance.now();
                for (let i = 0; i < 1000; i++) {
                    manager.executeStrategies(board);
                }
                const endTime = performance.now();
                
                const executionTime = endTime - startTime;
                results[boardName] = executionTime;
                
                console.log(`Combined strategies on ${boardName}:`);
                console.log(`- Total time: ${executionTime.toFixed(2)}ms`);
                console.log(`- Average time per iteration: ${(executionTime / 1000).toFixed(3)}ms`);
            }

            // 验证性能是否在可接受范围内
            Object.values(results).forEach(time => {
                expect(time).toBeLessThan(10000); // 10秒内完成1000次迭代
            });
        });

        test('Memory usage test', () => {
            const board = stringToMatrix(testCases.simple2);
            const initialMemory = process.memoryUsage().heapUsed;
            
            // 执行1000次迭代
            for (let i = 0; i < 1000; i++) {
                manager.executeStrategies(board);
            }
            
            const finalMemory = process.memoryUsage().heapUsed;
            const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // 转换为MB
            
            console.log(`Memory usage increase: ${memoryIncrease.toFixed(2)}MB`);
            expect(memoryIncrease).toBeLessThan(100); // 内存增长不超过100MB
        });
    });

    describe('Comparative Analysis', () => {
        test('Compare individual vs combined strategy performance', () => {
            const board = stringToMatrix(testCases.simple2);
            const results = {};

            // 测试每个单独策略
            for (const { name, strategy } of strategies) {
                const startTime = performance.now();
                for (let i = 0; i < 100; i++) {
                    strategy.get_candidate(board);
                }
                const endTime = performance.now();
                results[name] = endTime - startTime;
            }

            // 测试组合策略
            const combinedStartTime = performance.now();
            for (let i = 0; i < 100; i++) {
                manager.executeStrategies(board);
            }
            const combinedEndTime = performance.now();
            results['Combined'] = combinedEndTime - combinedStartTime;

            // 输出比较结果
            console.log('\nPerformance Comparison (100 iterations):');
            Object.entries(results).forEach(([name, time]) => {
                console.log(`${name}: ${time.toFixed(2)}ms (${(time/100).toFixed(3)}ms per iteration)`);
            });

            // 验证组合策略的性能开销
            const avgIndividualTime = Object.values(results).slice(0, -1).reduce((a, b) => a + b, 0) / strategies.length;
            const combinedTime = results['Combined'];
            const overhead = combinedTime / avgIndividualTime;
            
            console.log(`\nPerformance overhead of combined strategies: ${overhead.toFixed(2)}x`);
            expect(overhead).toBeLessThan(10); // 组合策略的开销不应超过单个策略的10倍
        });
    });
}); 