import { writable, get } from 'svelte/store';
import { userGrid } from '@sudoku/stores/grid';
import { candidates } from '@sudoku/stores/candidates';

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
        const candidatesState = {...get(candidates)};
        return {
            grid: JSON.parse(JSON.stringify(gridState)),
            candidates: candidatesState
        };
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
                return state;
            }

            // 恢复该分支点的状态
            const snapshot = state.snapshots[branchId];
            if (snapshot) {
                userGrid.set(snapshot.grid);
                candidates.set({...snapshot.candidates});
            }

            // 更新分支点的访问次数
            const updatedBranchPoints = state.branchPoints.map(b => 
                b.id === branchId 
                    ? { ...b, visitCount: b.visitCount + 1, isActive: b.visitCount < 1 }
                    : b
            );

            return {
                ...state,
                branchPoints: updatedBranchPoints,
                currentBranch: branch.visitCount < 1 ? branch : null
            };
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
        updateBranchPointCandidates: (position, candidatesList) => update(state => {
            const updatedBranchPoints = state.branchPoints.map(branch => {
                if (branch.position === position) {
                    // 如果没有候选数了，标记为非活动
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
        clear: () => set(initialState)
    };
}

export const history = createHistoryStore(); 