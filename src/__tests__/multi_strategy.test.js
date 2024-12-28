import { basic_startegy } from '@sudoku/strategy/basic.js';
import { manager } from '@sudoku/strategy/strategy_manager.js';
import { naked_pairs_strategy } from '@sudoku/strategy/naked_pairs.js';
import { naked_triple_strategy } from '@sudoku/strategy/naked_triple.js';
import { naked_quad_strategy } from '@sudoku/strategy/naked_quad.js';
import { hidden_pairs_strategy } from '@sudoku/strategy/hidden_pairs.js';
import { x_wing_strategy } from '@sudoku/strategy/fish.js';

// const sudokuString = "080090030030000069902063158020804590851907045394605870563040987200000015010050020";
// const sudokuString_naked_triple = "294513006600842319300697254000056000040080060000470000730164005900735001400928637";
// const sudokuString_naked_quad = "000030086000020040090078520371856294900142375400397618200703859039205467700904132";

test('multi strategy', () => {
    const matrix = stringToMatrix("720408030080000047401076802810739000000851000000264080209680413340000008168943275");
    manager.addStrategy(naked_pairs_strategy)
    manager.addStrategy(basic_startegy)
    manager.addStrategy(naked_triple_strategy)
    manager.addStrategy(naked_quad_strategy)
    manager.addStrategy(hidden_pairs_strategy)
    let candidates = manager.executeStrategies(matrix);

    console.log(candidates);

    //expect(result).toBe(true);
});

test('x_wing strategy', () => {
    const matrix = stringToMatrix("100000569402000008050009040000640801000010000208035000040500010900000402621000005");
    manager.addStrategy(naked_pairs_strategy)
    manager.addStrategy(basic_startegy)
    manager.addStrategy(naked_triple_strategy)
    manager.addStrategy(naked_quad_strategy)
    manager.addStrategy(hidden_pairs_strategy)
    manager.addStrategy(x_wing_strategy)

    let candidates = manager.executeStrategies(matrix);

    console.log(candidates);

    //expect(result).toBe(true);
});

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