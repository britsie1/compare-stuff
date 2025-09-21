module.exports = {
  transform: {
    '^.+\.jsx?$': 'babel-jest',
    '^.+\.mjs$': 'babel-jest',
  },
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.jsx'],
  moduleNameMapper: {
    '\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    '^\.\/config\/firebaseConfig$': '<rootDir>/__mocks__/src/config/firebaseConfig.js',
    '^firebase/app$': '<rootDir>/__mocks__/firebase/app.js',
    '^firebase/firestore$': '<rootDir>/__mocks__/firebase/firestore.js'
  },
  setupFilesAfterEnv: ['./jest.setup.js'],
};