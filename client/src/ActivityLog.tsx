import React, { useEffect, useState } from 'react';
import { api } from './api';
import { ActionLog } from './types';
import { socket } from './socket';

type Props = {
  token: string;
};

function ActivityLog({ token }: Props) {
  const [actions, setActions] = useState([] as ActionLog[]);

  useEffect(() => {
    api.get('/actions').then(res => setActions(res.data));
    const update = () => api.get('/actions').then(res => setActions(res.data));
    socket.on('task:add', update);
    socket.on('task:edit', update);
    socket.on('task:delete', update);
    return () => {
      socket.off('task:add', update);
      socket.off('task:edit', update);
      socket.off('task:delete', update);
    };
  }, []);

  return (
    <div className="activity-log">
      <h3>Activity Log</h3>
      <ul>
        {actions.map(a => (
          <li key={a._id}>
            <span>{a.details}</span> <span style={{ fontSize: 10, color: '#888' }}>{new Date(a.createdAt).toLocaleTimeString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ActivityLog; 