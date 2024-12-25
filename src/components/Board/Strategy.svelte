<script>
	import { CANDIDATE_COORDS } from '@sudoku/constants';

	export let strategy = [];
</script>

<div class="strategy-grid">
	{#each CANDIDATE_COORDS as [row, col], index}
		<div class="strategy row-start-{row} col-start-{col}"
		     class:invisible={!strategy.includes(index + 1)}
		     class:visible={strategy.includes(index + 1)}>
			{index + 1}
		</div>
	{/each}
</div>

<style>
	.strategy-grid {
		@apply grid h-full w-full p-1;
	}

	.strategy {
		@apply h-full w-full row-end-auto col-end-auto leading-full;
	}
</style>