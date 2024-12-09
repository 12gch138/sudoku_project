import { writable } from 'svelte/store';

function createCandidatesStore() {
    const { subscribe, set, update } = writable({});

    return {
        subscribe,
        set,
        // 添加候选数
        add: (cursor, num) => update(candidates => {
            const key = cursor.x + ',' + cursor.y;
            const current = candidates[key] || [];
            if (!current.includes(num)) {
                candidates[key] = [...current, num].sort((a, b) => a - b);
            }
            return candidates;
        }),
        // 清除指定位置的候选数
        clear: (cursor) => update(candidates => {
            const key = cursor.x + ',' + cursor.y;
            delete candidates[key];
            return candidates;
        }),
        // 设置指定位置的候选数
        set: (cursor, nums) => update(candidates => {
            const key = cursor.x + ',' + cursor.y;
            if (nums && nums.length > 0) {
                candidates[key] = [...nums].sort((a, b) => a - b);
            } else {
                delete candidates[key];
            }
            return candidates;
        }),
        // 清空所有候选数
        clearAll: () => set({})
    };
}

export const candidates = createCandidatesStore(); 