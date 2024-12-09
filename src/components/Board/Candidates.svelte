<script>
	import { CANDIDATE_COORDS } from '@sudoku/constants';
	import { history } from '../stores/history';
	import { cursor } from '@sudoku/stores/cursor';

	export let candidates = [];

	function handleCandidateClick(num) {
		const position = $cursor.x + ',' + $cursor.y;
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
		     on:click|stopPropagation={() => handleCandidateClick(index + 1)}>
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

	.candidate.visible:hover {
		@apply text-primary font-bold;
	}
</style>