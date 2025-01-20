<script>
	import { candidates,iscandidates } from '@sudoku/stores/candidates';
	import { userGrid,promptGrid } from '@sudoku/stores/grid';
	import { cursor } from '@sudoku/stores/cursor';
	import { hints } from '@sudoku/stores/hints';
	import { notes } from '@sudoku/stores/notes';
	import { strategy_buttom } from '@sudoku/stores/strategy_buttom';
	import { settings } from '@sudoku/stores/settings';
	import { keyboardDisabled } from '@sudoku/stores/keyboard';
	import { gamePaused } from '@sudoku/stores/game';
	import {updateUserGridFromCoordinates,change_testgrid,candidate_len} from '@sudoku/stores/prompt';
	import { history } from '../../stores/history';

	$: hintsAvailable = $hints > 0;
	$: canUndo = $history.past.length > 0;
	$: canRedo = $history.future.length > 0;
	$: hasActiveBranches = $history.branchPoints.some(branch => branch.isActive);

	function handleHint() {
		if (hintsAvailable) {
			if ($candidates.hasOwnProperty($cursor.x + ',' + $cursor.y)) {
				candidates.clear($cursor);
			}

			const oldValue = $userGrid[$cursor.y][$cursor.x];
			const oldValue_prompt = $promptGrid[$cursor.y][$cursor.x];
			userGrid.applyHint($cursor);
			const newValue = $userGrid[$cursor.y][$cursor.x];
			const newValue_prompt = $promptGrid[$cursor.y][$cursor.x];

			// 记录操作历史
			history.push({
				type: 'hint',
				position: { x: $cursor.x, y: $cursor.y },
				oldValue,
				newValue,
			});
		}
	}

	function handleUndo() {
		if (!$gamePaused && canUndo) {
			const action = $history.past[$history.past.length - 1];
			history.undo();
			
			// 根据操作类型执行撤销
			switch (action.type) {
				case 'hint':
				case 'input':
					userGrid.set({ x: action.position.x, y: action.position.y }, action.oldValue);
					promptGrid.set({ x: action.position.x, y: action.position.y }, action.oldValue);
					break;
				// 可以添加其他类型的操作处理
			}
		}
	}

	function handleRedo() {
		if (!$gamePaused && canRedo) {
			const action = $history.future[0];
			history.redo();
			
			// 根据操作类型执行重做
			switch (action.type) {
				case 'hint':
				case 'input':
					userGrid.set({ x: action.position.x, y: action.position.y }, action.newValue);
					promptGrid.set({ x: action.position.x, y: action.position.y }, action.newValue);
					break;
				// 可以添加其他类型的操作处理
			}
		}
	}

	function setter(){
		$candidate_len = $candidate_len + 1;
		iscandidates.update(value=>true);
		updateUserGridFromCoordinates();

	}
	function change(){
		change_testgrid();
	}

	function handleJumpToLatestBranch() {
		if (!$gamePaused) {
			history.jumpToLatestBranch();
		}
	}
</script>

<div class="action-buttons space-x-3">

	<button class="btn btn-round" disabled={$gamePaused || !canUndo} on:click={handleUndo} title="Undo">
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
		</svg>
	</button>

	<button class="btn btn-round" disabled={$gamePaused || !canRedo} on:click={handleRedo} title="Redo">
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 90 00-8 8v2M21 10l-6 6m6-6l-6-6" />
		</svg>
	</button>

	<button class="btn btn-round" disabled={$gamePaused || !hasActiveBranches} on:click={handleJumpToLatestBranch} title="跳转到最新分支">
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
		</svg>
	</button>

	<button class="btn btn-round btn-badge" disabled={$keyboardDisabled || !hintsAvailable || $userGrid[$cursor.y][$cursor.x] !== 0} on:click={handleHint} title="Hints ({$hints})">
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
		</svg>

		{#if $settings.hintsLimited}
			<span class="badge" class:badge-primary={hintsAvailable}>{$hints}</span>
		{/if}
	</button>

	<button class="btn btn-round btn-badge" on:click={notes.toggle} title="Notes ({$notes ? 'ON' : 'OFF'})">
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
		</svg>

		<span class="badge tracking-tighter" class:badge-primary={$notes}>{$notes ? 'ON' : 'OFF'}</span>
	</button>

	<!-- <button class="btn btn-round btn-badge" on:click={setter} title="strategy ({$strategy_buttom ? 'ON' : 'OFF'})">
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
		</svg>

		<span class="badge tracking-tighter" class:badge-primary={$strategy_buttom}>{$strategy_buttom ? 'ON' : 'OFF'}</span>
	</button> -->

	<button class="btn btn-round" on:click={setter} title="Circle Button">
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<circle cx="12" cy="12" r="10" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
		</svg>
	</button>
	

</div>

<style>
	.action-buttons {
		@apply flex flex-wrap justify-evenly self-end;
	}

	.btn-badge {
		@apply relative;
	}

	.badge {
		min-height: 20px;
		min-width:  20px;
		@apply p-1 rounded-full leading-none text-center text-xs text-white bg-gray-600 inline-block absolute top-0 left-0;
	}

	.badge-primary {
		@apply bg-primary;
	}
</style>