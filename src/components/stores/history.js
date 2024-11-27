import { writable } from 'svelte/store';

// 历史记录结构
const initialState = {
    past: [],        // 过去的状态
    future: [],      // 未来的状态（用于重做）
    maxHistory: 50   // 最大历史记录数
};

function createHistoryStore() {
    const { subscribe, set, update } = writable(initialState);

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
        // 撤销操作
        undo: () => update(state => {
            if (state.past.length === 0) return state;
            
            const previous = state.past[state.past.length - 1];
            const newPast = state.past.slice(0, -1);
            
            return {
                past: newPast,
                future: [previous, ...state.future],
                maxHistory: state.maxHistory
            };
        }),
        // 重做操作
        redo: () => update(state => {
            if (state.future.length === 0) return state;
            
            const next = state.future[0];
            const newFuture = state.future.slice(1);
            
            return {
                past: [...state.past, next],
                future: newFuture,
                maxHistory: state.maxHistory
            };
        }),
        // 清空历史记录
        clear: () => set(initialState)
    };
}

export const history = createHistoryStore(); 