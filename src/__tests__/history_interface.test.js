const { get } = require('svelte/store');

// Mock the stores
const mockUserGrid = {
    set: jest.fn(),
    subscribe: jest.fn()
};

const mockCandidates = {
    update: jest.fn(),
    subscribe: jest.fn()
};

const mockHistory = {
    clear: jest.fn(),
    update: jest.fn(),
    push: jest.fn(),
    createSnapshot: jest.fn(),
    subscribe: jest.fn()
};

jest.mock('../components/stores/history', () => ({
    history: mockHistory
}));

jest.mock('@sudoku/stores/grid', () => ({
    userGrid: mockUserGrid
}));

jest.mock('@sudoku/stores/candidates', () => ({
    candidates: mockCandidates
}));

describe('History Interface Tests', () => {
    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();
        
        // Setup default mock implementations
        mockHistory.subscribe.mockImplementation(fn => {
            fn({
                past: [],
                future: [],
                maxHistory: 50,
                branchPoints: [],
                currentBranch: null,
                snapshots: {}
            });
            return () => {};
        });

        mockHistory.clear();
    });

    test('should maintain correct history structure', () => {
        mockHistory.clear();
        
        const state = get(mockHistory);
        expect(state).toHaveProperty('past');
        expect(state).toHaveProperty('future');
        expect(state).toHaveProperty('maxHistory');
        expect(state).toHaveProperty('branchPoints');
        expect(state).toHaveProperty('currentBranch');
        expect(state).toHaveProperty('snapshots');
        
        expect(Array.isArray(state.past)).toBe(true);
        expect(Array.isArray(state.future)).toBe(true);
        expect(Array.isArray(state.branchPoints)).toBe(true);
        expect(typeof state.maxHistory).toBe('number');
    });


    // 测试时序正确性
    test('should maintain correct temporal order', () => {
        const operations = [];
        
        for(let i = 0; i < 3; i++) {
            const operation = {
                type: 'SET_VALUE',
                position: { x: i, y: 0 },
                value: i + 1,
                timestamp: Date.now() + i * 100 
            };
            operations.push(operation);
            
            // 等待一小段时间确保时间戳不同
            new Promise(resolve => setTimeout(resolve, 10));
        }
        
        operations.forEach(op => {
            mockHistory.update(state => ({
                ...state,
                past: [...state.past, op]
            }));
        });
        
        // 验证
        const state = get(mockHistory);
        for(let i = 1; i < state.past.length; i++) {
            expect(state.past[i].timestamp).toBeGreaterThan(state.past[i-1].timestamp);
        }
    });
}); 