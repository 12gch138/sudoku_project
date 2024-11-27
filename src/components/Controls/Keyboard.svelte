<script>
	import { userGrid,promptGrid } from '@sudoku/stores/grid';
	import { cursor } from '@sudoku/stores/cursor';
	import { notes } from '@sudoku/stores/notes';
	import { candidates } from '@sudoku/stores/candidates';
	import {strategy_buttom} from '@sudoku/stores/strategy_buttom'
	import {strategy_display} from '@sudoku/stores/strategy_display'

	// TODO: Improve keyboardDisabled
	import { keyboardDisabled } from '@sudoku/stores/keyboard';
	import { history } from '../stores/history';

	function handleKeyButton(num) {
		if (!$keyboardDisabled) {
			if ($notes) {
				if (num === 0) {
					candidates.clear($cursor);
				} else {
					candidates.add($cursor, num);
				}
				userGrid.set($cursor, 0);
			} else {
				const oldValue = $userGrid[$cursor.y][$cursor.x];
				
				if ($candidates.hasOwnProperty($cursor.x + ',' + $cursor.y)) {
					candidates.clear($cursor);
				}

				userGrid.set($cursor, num);
				promptGrid.set($cursor, num);
			}

			if ($strategy_buttom) {
				strategy_display.update(userGrid.getMatrix());
				$strategy_display => {
					for (let key in strategy_display) {
						const pos = {y: key.split(',')[0], x: key.split(',')[1]}
						userGrid.set(key.split(','), strategy_display[key]);
					}
				}
			} else {
				strategy_display.clear();
				
				// 记录数字输入操作
				history.push({
					type: 'input',
					position: { x: $cursor.x, y: $cursor.y },
					oldValue,
					newValue: num
				});
			}
		}
	}

	function handleKey(e) {
		switch (e.key || e.keyCode) {
			case 'ArrowUp':
			case 38:
			case 'w':
			case 87:
				cursor.move(0, -1);
				break;

			case 'ArrowDown':
			case 40:
			case 's':
			case 83:
				cursor.move(0, 1);
				break;

			case 'ArrowLeft':
			case 37:
			case 'a':
			case 65:
				cursor.move(-1);
				break;

			case 'ArrowRight':
			case 39:
			case 'd':
			case 68:
				cursor.move(1);
				break;

			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
			case '9':
				handleKeyButton(parseInt(e.key));
				break;

			case '0':
			case 'Backspace':
			case 'Delete':
				handleKeyButton(0);
				break;
		}
	}
</script>

<svelte:window on:keydown={handleKey}/>

<div class="keyboard grid grid-cols-3 gap-2">
	{#each Array(9) as _, i}
		<button class="btn" disabled={$keyboardDisabled} on:click={() => handleKeyButton(i + 1)}>{i + 1}</button>
	{/each}
</div>

<style>
	.keyboard {
		@apply w-full;
	}

	.btn {
		@apply py-5;
	}
</style>