<script>
    import { history } from '../stores/history';
    import { fade, slide } from 'svelte/transition';

    // 格式化时间
    function formatTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // 格式化位置
    function formatPosition(pos) {
        const [x, y] = pos.split(',');
        return `(${parseInt(x) + 1}, ${parseInt(y) + 1})`;
    }

    // 获取分支点状态文本
    function getBranchStatus(branch) {
        if (!branch.isActive) return '已完成';
        if (branch.visitCount >= 2) return '已用尽';
        if (branch.visitCount === 1) return '已访问';
        return '可用';
    }

    // 获取分支点状态类名
    function getBranchStatusClass(branch) {
        if (!branch.isActive) return 'completed';
        if (branch.visitCount >= 2) return 'exhausted';
        if (branch.visitCount === 1) return 'visited';
        return 'available';
    }

    // 处理分支点点击
    function handleBranchClick(branch) {
        if (!branch.isActive || branch.visitCount >= 2) return;
        
        history.selectBranch(branch.id);
    }
</script>

<div class="branch-points-container">
    <h3 class="title">分支点 ({$history.branchPoints.length})</h3>
    
    {#if $history.branchPoints.length === 0}
        <div class="empty-state" transition:fade>
            暂无分支点
        </div>
    {:else}
        <div class="branch-points-list">
            {#each $history.branchPoints as branch (branch.id)}
                <div class="branch-point" 
                     class:active={branch.isActive}
                     class:selected={$history.currentBranch?.id === branch.id}
                     class:disabled={!branch.isActive || branch.visitCount >= 2}
                     class:clickable={branch.isActive && branch.visitCount < 2}
                     transition:slide
                     on:click={() => handleBranchClick(branch)}>
                    <div class="branch-header">
                        <span class="position">{formatPosition(branch.position)}</span>
                        <span class="time">{formatTime(branch.timestamp)}</span>
                    </div>
                    <div class="candidates">
                        候选数：{branch.candidates.join(', ')}
                    </div>
                    <div class="status status-{getBranchStatusClass(branch)}">
                        {getBranchStatus(branch)}
                        {#if branch.isActive && branch.visitCount < 2}
                            <span class="click-hint">点击回溯</span>
                        {/if}
                    </div>
                    {#if branch.visitCount > 0}
                        <div class="visit-count">
                            已访问 {branch.visitCount} 次
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .branch-points-container {
        @apply p-4 bg-white rounded-lg shadow-md;
    }

    .title {
        @apply text-lg font-semibold mb-4;
    }

    .empty-state {
        @apply text-center text-gray-500 py-4;
    }

    .branch-points-list {
        margin-top: 0.5rem; /* 等效于 space-y-2 的效果 */
    }

    .branch-point {
        @apply p-3 rounded-lg border border-gray-200 transition-all duration-200;
    }

    .branch-point.clickable {
        cursor: pointer;
        transition: box-shadow 0.2s ease, border-color 0.2s ease;
    }

    .branch-point.clickable:hover {
        box-shadow: var(--tw-shadow-md);
        border-color: var(--tw-border-opacity) var(--tw-color-primary);
    }


    .branch-point.clickable:hover {
        transform: translateY(-1px);
    }

    .branch-point.clickable:active {
        transform: translateY(0);
    }

    .branch-point.active {
        @apply border-primary border-opacity-50;
    }

    .branch-point.selected {
        background-color: var(--tw-color-primary);
        background-opacity: 0.1;
    }


    .branch-point.disabled {
        @apply opacity-50 cursor-not-allowed;
    }

    .branch-header {
        @apply flex justify-between items-center mb-2;
    }

    .position {
        @apply font-medium;
    }

    .time {
        @apply text-sm text-gray-500;
    }

    .candidates {
        @apply text-sm text-gray-600 mb-1;
    }

    .status {
        @apply text-xs px-2 py-1 rounded-full inline-flex items-center gap-2;
    }

    .click-hint {
        @apply text-xs text-primary-dark font-medium;
    }

    .visit-count {
        @apply text-xs text-gray-500 mt-1;
    }

    .status-available {
        @apply bg-green-100 text-green-800;
    }

    .status-visited {
        @apply bg-yellow-100 text-yellow-800;
    }

    .status-exhausted {
        @apply bg-red-100 text-red-800;
    }

    .status-completed {
        @apply bg-gray-100 text-gray-800;
    }
</style>

