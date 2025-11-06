export default {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  extensionsToTreatAsEsm: [".jsx"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(react-markdown|remark-gfm|unist-util-visit|vfile|micromark|estree-util-is-identifier-name)/)",
  ],
  setupFiles: ["./jest.setup.js"], // ✅ Add this line
};
