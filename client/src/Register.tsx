import React, { useState } from 'react';
import { api } from './api';

type Props = {
  onLogin: (user: any, token: string) => void;
  onSwitch: () => void;
};

function Register({ onLogin, onSwitch }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/users/register', { username, password });
      const res = await api.post('/users/login', { username, password });
      const token = res.data.token;
      onLogin({ username }, token);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
        <button type="submit">Register</button>
      </form>
      {error && <div className="error">{error}</div>}
      <p>Already have an account? <button onClick={onSwitch}>Login</button></p>
    </div>
  );
}

export default Register; 