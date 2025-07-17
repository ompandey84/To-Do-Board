import React, { useEffect, useState } from 'react';
import { api } from './api';
import { socket } from './socket';
import { Task, User, TaskStatus } from './types';

type Props = {
  user: User;
  token: string;
};

const columns: TaskStatus[] = ['Todo', 'In Progress', 'Done'];

function KanbanBoard({ user, token }: Props) {
  const [tasks, setTasks] = useState([]);
  const [dragged, setDragged] = useState(null);

  useEffect(() => {
    api.get('/tasks').then(res => setTasks(res.data));
    socket.on('task:add', (task: Task) => setTasks(ts => [...ts, task]));
    socket.on('task:edit', (task: Task) => setTasks(ts => ts.map(t => t._id === task._id ? task : t)));
    socket.on('task:delete', ({ id }: { id: string }) => setTasks(ts => ts.filter(t => t._id !== id)));
    return () => {
      socket.off('task:add');
      socket.off('task:edit');
      socket.off('task:delete');
    };
  }, []);

  const onDragStart = (task: Task) => setDragged(task);
  const onDrop = (status: TaskStatus) => {
    if (dragged && dragged.status !== status) {
      api.put(`/tasks/${dragged._id}`, { ...dragged, status, __v: dragged.__v }).catch(() => {});
    }
    setDragged(null);
  };

  return (
    <div className="kanban-board">
      {columns.map(col => (
        <div key={col} className="kanban-column" onDragOver={e => e.preventDefault()} onDrop={() => onDrop(col)}>
          <h3>{col}</h3>
          {tasks.filter(t => t.status === col).map(task => (
            <div key={task._id} className="kanban-task" draggable onDragStart={() => onDragStart(task)}>
              <div>{task.title}</div>
              <div style={{ fontSize: 12 }}>{task.description}</div>
              <div style={{ fontSize: 10 }}>Assigned: {typeof task.assignedTo === 'object' ? task.assignedTo.username : ''}</div>
              <button onClick={() => api.post(`/tasks/${task._id}/smart-assign`, { __v: task.__v })}>Smart Assign</button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default KanbanBoard; 