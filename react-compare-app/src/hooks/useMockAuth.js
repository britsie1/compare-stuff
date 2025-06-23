import { useState, useEffect } from 'react';

// Mock Authentication Hook - Replace with real Firebase auth later
export const useMockAuth = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Simulate checking for an existing session
        const loggedInUser = localStorage.getItem('comparisonUser');
        if (loggedInUser) {
            setUser(JSON.parse(loggedInUser));
        }
    }, []);

    const login = () => {
        const mockUser = { id: '123', name: 'Demo User' };
        localStorage.setItem('comparisonUser', JSON.stringify(mockUser));
        setUser(mockUser);
        console.log("Mock login successful!");
    };

    const logout = () => {
        localStorage.removeItem('comparisonUser');
        setUser(null);
        console.log("Mock logout successful!");
    };

    return { user, login, logout };
};