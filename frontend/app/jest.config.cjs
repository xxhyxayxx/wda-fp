module.exports = {
  transform: {
    "^.+\\.jsx?$": "babel-jest"
  },
  testEnvironment: "jest-environment-jsdom"  // ここを更新
};
