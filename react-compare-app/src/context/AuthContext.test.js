import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider } from './AuthProvider';
import { useAuth } from './authHooks';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';

// Mock firebase/auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  FacebookAuthProvider: jest.fn(),
}));

// Mock services/auth
jest.mock('../services/auth', () => ({
  auth: {},
}));

const TestComponent = () => {
  const { currentUser, loading, signInWithGoogle, signInWithFacebook, logout } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {currentUser ? (
        <div>
          <span data-testid="user-name">{currentUser.displayName}</span>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <span data-testid="no-user">No user</span>
          <button onClick={signInWithGoogle}>Sign in with Google</button>
          <button onClick={signInWithFacebook}>Sign in with Facebook</button>
        </div>
      )}
    </div>
  );
};

describe('AuthContext', () => {
  let onAuthStateChangedCallback;

  beforeEach(() => {
    onAuthStateChanged.mockImplementation((auth, callback) => {
      onAuthStateChangedCallback = callback;
      // Return a mock unsubscribe function
      return jest.fn();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state initially', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should show "No user" when auth state is resolved with no user', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      onAuthStateChangedCallback(null);
    });

    expect(screen.getByTestId('no-user')).toBeInTheDocument();
  });

  it('should show user information when a user is signed in', async () => {
    const mockUser = { uid: '123', displayName: 'Test User', email: 'test@example.com', photoURL: 'photo.jpg' };
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      onAuthStateChangedCallback(mockUser);
    });

    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
  });

  it('should call signInWithPopup with GoogleAuthProvider', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await act(async () => {
      onAuthStateChangedCallback(null);
    });

    const googleButton = screen.getByText('Sign in with Google');
    await act(async () => {
      googleButton.click();
    });

    expect(signInWithPopup).toHaveBeenCalled();
  });

  it('should call signInWithPopup with FacebookAuthProvider', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await act(async () => {
      onAuthStateChangedCallback(null);
    });

    const facebookButton = screen.getByText('Sign in with Facebook');
    await act(async () => {
      facebookButton.click();
    });

    expect(signInWithPopup).toHaveBeenCalled();
  });

  it('should call signOut when logout is called', async () => {
    const mockUser = { uid: '123', displayName: 'Test User' };
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      onAuthStateChangedCallback(mockUser);
    });

    const logoutButton = screen.getByText('Logout');
    await act(async () => {
      logoutButton.click();
    });

    expect(signOut).toHaveBeenCalled();
  });

  it('throws an error when useAuth is used outside of an AuthProvider', () => {
    // Prevent console.error from cluttering test output
    const consoleError = console.error;
    console.error = jest.fn();

    expect(() => render(<TestComponent />)).toThrow('useAuth must be used within an AuthProvider');

    console.error = consoleError;
  });
});
