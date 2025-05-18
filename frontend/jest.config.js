module.exports = {
    transformIgnorePatterns: [
      "/node_modules/(?!(axios|react-router-dom|react-router|@remix-run)/).+\\.js$"
    ],
    setupFilesAfterEnv: [
      "<rootDir>/src/setupTests.js"
    ],
    moduleNameMapper: {
      "\\.(css|less|scss|sass)$": "identity-obj-proxy",
      "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/__mocks__/fileMock.js"
    },
    testEnvironment: "jsdom",
    clearMocks: true,
    transform: {
      "^.+\\.(js|jsx|ts|tsx)$": "babel-jest"
    }
  }
  