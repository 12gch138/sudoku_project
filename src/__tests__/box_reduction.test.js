// 对应策略逻辑有误，待修改
import { box_line_reduction_strategy } from '@sudoku/strategy/box_reduction.js';
import { basic_startegy } from '@sudoku/strategy/basic.js';
import { manager } from '@sudoku/strategy/strategy.js';
import { naked_pairs_strategy } from '@sudoku/strategy/naked_pairs.js';
import { naked_triple_strategy } from '@sudoku/strategy/naked_triple.js';
import { naked_quad_strategy } from '@sudoku/strategy/naked_quad.js';
import { hidden_pairs_strategy } from '@sudoku/strategy/hidden_pairs.js';

function stringToMatrix(str) {
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

/// 临时函数，后可能添加为candidate类的方法
/// 比较两个候选数矩阵，找出差异，返回元素类型{position:[row, col],value: num,source: 'candidates2'}的数组
function findCandidateDifferences(candidates1, candidates2) {
    const differences = [];
    
    // 遍历所有位置
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            // 获取两个位置的候选数
            const set1 = new Set(candidates1[row][col] || []);
            const set2 = new Set(candidates2[row][col] || []);
            
            // 找出只在 candidates1 中的数字
            for (const num of set1) {
                if (!set2.has(num)) {
                    differences.push({
                        position: [row, col],
                        value: num,
                        source: 'candidates1'
                    });
                }
            }
            
            // 找出只在 candidates2 中的数字
            for (const num of set2) {
                if (!set1.has(num)) {
                    differences.push({
                        position: [row, col],
                        value: num,
                        source: 'candidates2'
                    });
                }
            }
        }
    }
    
    return differences;
}

/// 临时函数，后可能添加为candidate类的方法
/// 打印候选矩阵变化
function printCandidateDifferences(differences) {
    // 打印变化
    if (differences.length > 0) {
        console.log('\n候选数变化:');
        differences.forEach(diff => {
            const [row, col] = diff.position;
            console.log(
                `位置(${row},${col})的数字${diff.value}在` +
                `${diff.source === 'candidates1' ? '原始' : '更新后'}候选数中被${diff.source === 'candidates1' ? '删除' : '添加'}`
            );
        });
    } else {
        console.log('\n没有候选数发生变化');
    }
}

describe('Box_Line_Reduction_Strategy', () => {
    // 跳过测试，待修改
    test.skip('应从行中消除候选数', () => {
        const inputString = 
            "017903600000080000900000507072010430000402070064370250701000065000030000005601720";
        
        const board = stringToMatrix(inputString);
        
        // 打印初始盘面
        console.log('\n初始盘面：');
        //printBoard(board);

        // 初始化候选数
        //let candidates = basic_startegy.get_candidate(board);
        manager.addStrategy(naked_pairs_strategy)
        manager.addStrategy(basic_startegy)
        manager.addStrategy(naked_triple_strategy)
        manager.addStrategy(naked_quad_strategy)
        manager.addStrategy(hidden_pairs_strategy)
        let candidates = manager.executeStrategies(board);
        console.log('\n初始候选数：');
        //printCandidates(candidates);
        
        // 应用策略
        const updatedCandidates = box_line_reduction_strategy.get_candidate(candidates);
        
        // 找出候选数的变化
        const differences = findCandidateDifferences(candidates, updatedCandidates);
        
        printCandidateDifferences(differences);
    });

    // test('应从列中消除候选数', () => {
    //     const inputString = 
    //         "000260701" +
    //         "680070090" +
    //         "190004500" +
    //         "820100040" +
    //         "004602900" +
    //         "050003028" +
    //         "009300074" +
    //         "040050036" +
    //         "703018000";
            
    //     const board = stringToMatrix(inputString);
        
    //     console.log('\n初始盘面：');
    //     printBoard(board);

    //     let candidates = basic_startegy.get_candidate(board);
    //     const updatedCandidates = box_line_reduction_strategy.get_candidate(board);
        
    //     console.log('\n更新后的候选数：');
    //     console.log(JSON.stringify(updatedCandidates, null, 2));
    // });
});