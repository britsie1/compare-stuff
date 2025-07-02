module.exports = {
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.jsx'],
  // If you use ESM in your own code, add:
  // "extensionsToTreatAsEsm": [".js", ".jsx"],
};