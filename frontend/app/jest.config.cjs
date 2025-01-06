module.exports = {
  transform: {
    "^.+\\.jsx?$": "babel-jest", // JS/JSXのトランスフォーム
  },
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy", // CSSファイルをモック
  },
  setupFiles: ["<rootDir>/jest.setup.js"], // Jestのセットアップファイルを指定
  testEnvironment: "jsdom", // テスト環境をブラウザライクに
};
