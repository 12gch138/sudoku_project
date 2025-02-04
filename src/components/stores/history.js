import { writable, get } from 'svelte/store';
import { userGrid, promptGrid } from '@sudoku/stores/grid';
import { candidates } from '@sudoku/stores/candidates';
import { manager } from "@sudoku/strategy/strategy_manager"

// 历史记录结构
const initialState = {
    past: [],        // 过去的状态
    future: [],      // 未来的状态（用于重做）
    maxHistory: 50,  // 最大历史记录数
    branchPoints: [], // 分支点列表
    currentBranch: null, // 当前活动的分支点
    snapshots: {} // 存储分支点的状态快照
};

function createHistoryStore() {
    const { subscribe, set, update } = writable(initialState);

    // 创建当前状态的快照
    function createSnapshot() {
        const gridState = get(userGrid);
        const candidatesState = get(candidates);
        const prompt_grid = get(promptGrid)
        const CandidateBefore = manager.CandidateBefore;
        
        return {
            grid: JSON.parse(JSON.stringify(gridState)),
            candidates: JSON.parse(JSON.stringify(candidatesState)),
            candidates_before: JSON.parse(JSON.stringify(CandidateBefore)),
            prompt: JSON.parse(JSON.stringify(prompt_grid))
        };
    }

    // 恢复快照
    function restoreSnapshot(snapshot) {
        if (!snapshot) return;
        
        try {
            // 恢复数独格子状态
            if (snapshot.grid) {
                // 遍历网格并设置每个单元格的值
                for (let y = 0; y < snapshot.grid.length; y++) {
                    for (let x = 0; x < snapshot.grid[y].length; x++) {
                        userGrid.set({ x, y }, snapshot.grid[y][x]);
                        promptGrid.set({ x, y }, snapshot.prompt[y][x]);
                    }
                }
            }
            manager.CandidateBefore = snapshot.CandidateBefore;

            promptGrid.subscribe((grid)=>{
                console.log(grid);
            })
            
            // 恢复候选数状态
            if (snapshot.candidates) {
                // 先清除所有候选数
                for (let y = 0; y < snapshot.grid.length; y++) {
                    for (let x = 0; x < snapshot.grid[y].length; x++) {
                        // userGrid.set({ x, y }, snapshot.grid[y][x]);
                        candidates.clear({ x, y });
                    }
                }
                
                
                // 遍历并恢复每个位置的候选数
                Object.entries(snapshot.candidates).forEach(([position, nums]) => {
                    if (nums && nums.length > 0) {
                        const [x, y] = position.split(',').map(Number); 
                        
                        nums.forEach(num => {
                            candidates.add({ x, y }, num);
                        });
                    }
                });
            }
        } catch (error) {
            console.error('Error restoring snapshot:', error);
        }
    }

    return {
        subscribe,
        // 添加新的操作到历史记录
        push: (action) => update(state => {
            const newPast = [...state.past, action];
            // 如果超过最大历史记录数，删除最早的记录
            if (newPast.length > state.maxHistory) {
                newPast.shift();
            }
            return {
                ...state,
                past: newPast,
                future: [] // 新的操作会清空未来状态
            };
        }),
        // 添加分支点
        addBranchPoint: (position, candidatesList) => update(state => {
            const id = Date.now();
            console.log('branch point',position,candidatesList)
            const newBranchPoint = {
                id,
                position,
                candidates: [...candidatesList],
                timestamp: new Date(),
                isActive: true,
                visitCount: 0 // 添加访问次数计数
            };

            // 保存当前状态的快照
            const snapshot = createSnapshot();
            console.log('Creating branch point snapshot:', snapshot); // 调试日志

            return {
                ...state,
                branchPoints: [...state.branchPoints, newBranchPoint],
                currentBranch: newBranchPoint,
                snapshots: {
                    ...state.snapshots,
                    [id]: snapshot
                }
            };
        }),
        // 选择分支点并回溯状态
        selectBranch: (branchId) => update(state => {
            const branch = state.branchPoints.find(b => b.id === branchId);
            if (!branch || !branch.isActive || branch.visitCount >= 2) {
                console.log('Branch not selectable:', { branch, branchId }); // 调试日志
                return state;
            }

            try {
                // 恢复该分支点的状态
                const snapshot = state.snapshots[branchId];
                console.log('Restoring snapshot:', snapshot); // 调试日志
                restoreSnapshot(snapshot);

                // 更新分支点的访问次数
                const updatedBranchPoints = state.branchPoints.map(b => 
                    b.id === branchId 
                        ? { 
                            ...b, 
                            visitCount: b.visitCount + 1, 
                            isActive: b.visitCount < 1 
                        }
                        : b
                );

                return {
                    ...state,
                    branchPoints: updatedBranchPoints,
                    currentBranch: branch.visitCount < 1 ? branch : null
                };
            } catch (error) {
                console.error('Error in selectBranch:', error);
                return state;
            }
        }),
        // 标记分支点已完成
        completeBranch: (branchId) => update(state => {
            const updatedBranchPoints = state.branchPoints.map(branch => 
                branch.id === branchId ? { ...branch, isActive: false } : branch
            );
            return {
                ...state,
                branchPoints: updatedBranchPoints,
                currentBranch: state.currentBranch?.id === branchId ? null : state.currentBranch
            };
        }),
        // 移除指定位置的分支点
        removeBranchPointsByPosition: (position) => update(state => {
            const removedBranchPoints = state.branchPoints.filter(branch => branch.position === position);
            const updatedBranchPoints = state.branchPoints.filter(branch => branch.position !== position);
            
            // 清理对应的快照
            const updatedSnapshots = { ...state.snapshots };
            removedBranchPoints.forEach(branch => {
                delete updatedSnapshots[branch.id];
            });

            return {
                ...state,
                branchPoints: updatedBranchPoints,
                currentBranch: state.currentBranch?.position === position ? null : state.currentBranch,
                snapshots: updatedSnapshots
            };
        }),
        // 更新指定位置的分支点候选数
        updateBranchPointCandidates: (position, candidatesList, num) => update(state => {
            const updatedBranchPoints = state.branchPoints.map(branch => {
                if (branch.position === position && branch.candidates[0] === num) {
                    // 如果没有候选数了，标记为非活动
                    return { ...branch, isActive: false };
                    if (candidatesList.length === 0) {
                        return { ...branch, isActive: false };
                    }
                    return { ...branch, candidates: [...candidatesList] };
                }
                return branch;
            });
            return {
                ...state,
                branchPoints: updatedBranchPoints,
                currentBranch: state.currentBranch?.position === position && candidatesList.length === 0 
                    ? null 
                    : state.currentBranch
            };
        }),
        // 撤销操作
        undo: () => update(state => {
            if (state.past.length === 0) return state;
            
            const previous = state.past[state.past.length - 1];
            const newPast = state.past.slice(0, -1);
            
            return {
                ...state,
                past: newPast,
                future: [previous, ...state.future],
                maxHistory: state.maxHistory,
                branchPoints: state.branchPoints,
                currentBranch: state.currentBranch
            };
        }),
        // 重做操作
        redo: () => update(state => {
            if (state.future.length === 0) return state;
            
            const next = state.future[0];
            const newFuture = state.future.slice(1);
            
            return {
                ...state,
                past: [...state.past, next],
                future: newFuture,
                maxHistory: state.maxHistory,
                branchPoints: state.branchPoints,
                currentBranch: state.currentBranch
            };
        }),
        // 清空历史记录
        clear: () => set(initialState),
        // 跳转到最新分支点
        jumpToLatestBranch: () => update(state => {
            if (state.branchPoints.length === 0) return state;
            
            // 获取最新的活动分支点
            const latestBranch = [...state.branchPoints]
                .reverse()
                .find(branch => branch.isActive);
            
            if (!latestBranch) return state;
            
            try {
                // 恢复该分支点的状态
                const snapshot = state.snapshots[latestBranch.id];
                restoreSnapshot(snapshot);

                // 更新分支点的访问次数并标记为不可用
                const updatedBranchPoints = state.branchPoints.map(b => 
                    b.id === latestBranch.id 
                        ? { 
                            ...b, 
                            visitCount: b.visitCount + 1,
                            isActive: false // 直接标记为不可用
                        }
                        : b
                );

                return {
                    ...state,
                    branchPoints: updatedBranchPoints,
                    currentBranch: null // 由于分支已标记为不可用，所以currentBranch也设为null
                };
            } catch (error) {
                console.error('Error in jumpToLatestBranch:', error);
                return state;
            }
        })
    };
}

export const history = createHistoryStore(); 