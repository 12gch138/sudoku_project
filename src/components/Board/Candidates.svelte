<script>
	import { CANDIDATE_COORDS } from '@sudoku/constants';
	import { history } from '../stores/history';

	export let candidates = [];
	export let cellX;
	export let cellY;

	// 检查候选值是否已用尽（访问次数达到2次）
	function isExhausted(num) {
		const position = (cellX - 1) + ',' + (cellY - 1);  // 转换为0基坐标
		return $history.branchPoints.some(b => 
			b.position === position && 
			b.candidates.includes(num) && 
			(b.visitCount >= 2 || !b.isActive)
		);
	}

	function handleCandidateClick(event, num) {
		// 从点击的候选值元素向上查找到格子元素
		const cellElement = event.target.closest('.cell');
		if (!cellElement) return;
		
		// 从类名中提取行和列位置
		const rowMatch = cellElement.className.match(/row-start-(\d+)/);
		const colMatch = cellElement.className.match(/col-start-(\d+)/);
		
		if (!rowMatch || !colMatch) return;
		
		const row = parseInt(rowMatch[1]) - 1;  // 转换为0基坐标
		const col = parseInt(colMatch[1]) - 1;  // 转换为0基坐标
		
		const position = col + ',' + row;
		console.log('position',position)
		const branchPoint = $history.branchPoints.find(b => 
			b.position === position && 
			b.candidates.includes(num) && 
			b.isActive && 
			b.visitCount < 2
		);
		
		if (branchPoint) {
			history.selectBranch(branchPoint.id);
		}
	}
</script>

<div class="candidate-grid">
	{#each CANDIDATE_COORDS as [row, col], index}
		<div class="candidate row-start-{row} col-start-{col}"
			 class:invisible={!candidates.includes(index + 1)}
			 class:visible={candidates.includes(index + 1)}
			 class:exhausted={candidates.includes(index + 1) && isExhausted(index + 1)}
			 on:click|stopPropagation={(event) => handleCandidateClick(event,index + 1)}>
			{index + 1}
		</div>
	{/each}
</div>

<style>
	.candidate-grid {
		@apply grid h-full w-full p-1;
	}

	.candidate {
		@apply h-full w-full row-end-auto col-end-auto leading-full cursor-pointer;
	}

	/* 可选择的候选值样式
	.candidate.visible {
		@apply text-primary-dark cursor-pointer;
	} */

	/* 已用尽的候选值样式 */
	.candidate.exhausted {
		@apply text-gray-400 cursor-not-allowed;
	}

	/* 鼠标悬停效果 */
	.candidate.visible:hover:not(.exhausted) {
		@apply bg-primary-lighter text-primary-dark font-bold;
		border-radius: 4px;
	}

	/* 不可见的候选值 */
	.candidate.invisible {
		@apply opacity-0;
	}
</style>