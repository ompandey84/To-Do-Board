import React, { useState, useEffect } from 'react';
import { setAuthToken, api } from './api';
import { User } from './types';
import KanbanBoard from './KanbanBoard';
import ActivityLog from './ActivityLog';
import Login from './Login';
import Register from './Register';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    if (token) setAuthToken(token);
  }, [token]);

  if (!user) {
    return showRegister ? (
      <Register onLogin={(u, t) => { setUser(u); setToken(t); }} onSwitch={() => setShowRegister(false)} />
    ) : (
      <Login onLogin={(u, t) => { setUser(u); setToken(t); }} onSwitch={() => setShowRegister(true)} />
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <KanbanBoard user={user} token={token!} />
      <ActivityLog token={token!} />
    </div>
  );
};

export default App;
