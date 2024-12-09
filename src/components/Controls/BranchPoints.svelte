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
                     transition:slide
                     on:click={() => history.selectBranch(branch.id)}>
                    <div class="branch-header">
                        <span class="position">{formatPosition(branch.position)}</span>
                        <span class="time">{formatTime(branch.timestamp)}</span>
                    </div>
                    <div class="candidates">
                        候选数：{branch.candidates.join(', ')}
                    </div>
                    <div class="status status-{getBranchStatusClass(branch)}">
                        {getBranchStatus(branch)}
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

