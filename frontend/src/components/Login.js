import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

function Login({ onLogin }) {
  const handleGoogleSuccess = (credentialResponse) => {
    onLogin(credentialResponse);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Welcome to Toxic Comment Detector
        </h1>
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.log('Login Failed')}
          />
        </div>
      </div>
    </div>
  );
}

export default Login;
