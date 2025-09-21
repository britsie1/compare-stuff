export const getFirestore = jest.fn(() => ({}));
export const collection = jest.fn(() => ({}));
export const addDoc = jest.fn(() => Promise.resolve({ id: 'mock-doc-id' }));
export const doc = jest.fn(() => ({}));
export const updateDoc = jest.fn(() => Promise.resolve());
export const deleteDoc = jest.fn(() => Promise.resolve());
export const getDoc = jest.fn(() => Promise.resolve({
  exists: () => true,
  data: () => ({}),
  id: 'mock-doc-id'
}));
export const getDocs = jest.fn(() => Promise.resolve({
  forEach: (callback) => {
    callback({ id: 'mock-doc-id-1', data: () => ({}) });
    callback({ id: 'mock-doc-id-2', data: () => ({}) });
  },
  docs: [{ id: 'mock-doc-id-1', data: () => ({}) }, { id: 'mock-doc-id-2', data: () => ({}) }]
}));
export const query = jest.fn(() => ({}));
export const orderBy = jest.fn(() => ({}));
export const limit = jest.fn(() => ({}));
export const startAfter = jest.fn(() => ({}));
export const increment = jest.fn(() => 1);