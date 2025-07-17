export interface User {
  _id: string;
  username: string;
}

export type TaskStatus = 'Todo' | 'In Progress' | 'Done';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  assignedTo?: User | string;
  status: TaskStatus;
  priority: number;
  board?: string;
  __v?: number;
}

export interface ActionLog {
  _id: string;
  action: string;
  user: User | string;
  task: Task | string;
  details: string;
  createdAt: string;
} 