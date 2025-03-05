import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import Login from './components/Login';
import ToxicDetector from './components/ToxicDetector';
import { db } from './firebase/config';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (response) => {
    const decoded = jwtDecode(response.credential);
    
    // Generate a unique ID for new users
    const uniqueId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const userData = {
      name: decoded.name,
      picture: decoded.picture,
      email: decoded.email,
      userId: uniqueId
    };
  
    try {
      // Check if user exists by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', decoded.email));
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        // New user - create with unique ID
        const userRef = doc(db, 'users', uniqueId);
        await setDoc(userRef, {
          ...userData,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        });
      } else {
        // Existing user - get their stored userId
        const existingUser = querySnapshot.docs[0].data();
        userData.userId = existingUser.userId;
        
        const userRef = doc(db, 'users', existingUser.userId);
        await setDoc(userRef, {
          ...userData,
          lastLogin: new Date().toISOString()
        }, { merge: true });
      }
  
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Firebase error:', error);
    }
  };
  
  
  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  return (
    <GoogleOAuthProvider clientId="81565035404-8pt7do8l3ak16ctvk23i12vtia6oabm7.apps.googleusercontent.com">
      {!isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <ToxicDetector user={user} onLogout={handleLogout} />
      )}
    </GoogleOAuthProvider>
  );
}

export default App;
