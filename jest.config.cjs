module.exports = {
    roots: ['<rootDir>/src'],
    testMatch: [
        "**/__tests__/**/*.[jt]s?(x)",
        "**/?(*.)+(spec|test).[tj]s?(x)"
    ],
    moduleNameMapper: {
        '^@sudoku/strategy/(.*)$': '<rootDir>/src/node_modules/@sudoku/strategy/$1'
    },
    transform: {
        '^.+\\.js$': 'babel-jest',
    },
    transformIgnorePatterns: [
        "/node_modules/(?!@sudoku/strategy/)"
    ],
};


// **`transformIgnorePatterns`**: 默认情况下，Jest 会忽略 `node_modules` 目录中的文件。通过添加 `(?!@sudoku/strategy/)"，告知 Jest 不要忽略 `@sudoku/strategy` 目录下的模块