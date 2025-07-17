# To-Do-Board
Real-Time Collaborative To-Do Board A Live-Sync Kanban Solution with Smart Task Management.

# Real-Time Collaborative To-Do Board

![Kanban Board Screenshot](https://via.placeholder.com/800x450?text=Kanban+Board+Screenshot)
*(Replace this with an actual screenshot of your Kanban board)*

## Project Overview

This project is a full-stack, real-time collaborative To-Do Board application designed to mimic a minimal Trello-like experience. It allows multiple users to log in, manage tasks across "Todo," "In Progress," and "Done" columns, and see updates instantly thanks to WebSocket integration. The application includes custom business logic for "Smart Assign" and "Conflict Handling," along with a live activity log.

## Features

### Core Features:

* **User Authentication:** Secure user registration and login with hashed passwords and JWT-based authentication.
* **Kanban Board:**
    * Tasks displayed in three columns: "Todo," "In Progress," and "Done."
    * Intuitive drag-and-drop functionality to move tasks between columns.
    * Ability to reassign tasks to any registered user.
* **Task Management:** CRUD (Create, Read, Update, Delete) operations for tasks, including title, description, assigned user, status, and priority.
* **Real-Time Sync:** Instant updates across all connected clients using WebSockets (Socket.IO). Changes made by one user are immediately visible to others.
* **Activity Log:** A panel displaying the last 20 actions performed on the board, updating in real-time. Each action logs who did what and when.
* **Responsive Design:** The application is fully responsive and works seamlessly across desktop and mobile devices.
* **Custom UI & Animations:** Custom-built forms and styling without reliance on third-party UI libraries or CSS frameworks, featuring at least one custom animation (e.g., smooth drag-drop transitions).

### Unique Logic Challenges Implemented:

* **Smart Assign:** A "Smart Assign" button on each task, which, when clicked, automatically assigns the task to the user with the fewest currently active (non-"Done") tasks. This logic is implemented entirely on the backend.
* **Conflict Handling:** Detects when two users simultaneously edit the same task. When a conflict occurs, both users are presented with a resolution interface showing their changes versus the current server version, allowing them to choose to "merge" (manually reconcile and re-submit) or "overwrite" the conflicting changes.
* **Validation:**
    * Task titles are unique per board.
    * Task titles cannot match column names ("Todo", "In Progress", "Done").

## Tech Stack

* **Backend:**
    * **Node.js:** JavaScript runtime environment.
    * **Express.js:** Web application framework for Node.js.
    * **MongoDB:** NoSQL database for flexible data storage.
    * **Mongoose:** ODM (Object Data Modeling) library for MongoDB and Node.js.
    * **Socket.IO:** Real-time bi-directional event-based communication (WebSockets).
    * **Bcrypt.js:** For password hashing.
    * **JSON Web Tokens (JWT):** For secure user authentication.
* **Frontend:**
    * **React:** JavaScript library for building user interfaces.
    * **React Router DOM:** For declarative routing in React applications.
    * **Socket.IO Client:** For WebSocket communication with the backend.
    * **React Beautiful DnD:** For intuitive drag-and-drop functionality on the Kanban board.
    * **Vanilla CSS:** Custom styling for a unique UI/UX.

## Setup and Installation (Local)

Follow these steps to get the application running on your local machine.

### Prerequisites

* Node.js (LTS version recommended)
* npm or Yarn (Node package manager)
* MongoDB instance (local or cloud-hosted like MongoDB Atlas)

### 1. Clone the Repository

```bash
git clone [https://github.com/ompandey84/To-Do-Board.git](https://github.com/ompandey84/To-Do-Board.git)
cd To-Do-Board
````

### 2\. Backend Setup

Navigate into the `backend` directory, install dependencies, and configure environment variables.

```bash
cd backend
npm install # or yarn install
```

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string # e.g., mongodb://localhost:27017/todo_board OR your MongoDB Atlas URI
JWT_SECRET=a_very_secret_key_for_jwt # Generate a strong, random string
FRONTEND_URL=http://localhost:3000 # Or your deployed frontend URL
```

**Run the Backend:**

```bash
npm start # or yarn start
```

The backend server will start on `http://localhost:5000` (or your specified PORT).

### 3\. Frontend Setup

Open a new terminal, navigate into the `client` directory, install dependencies, and configure environment variables.

```bash
cd ../client # Go back to the project root, then into client
npm install # or yarn install
```

Create a `.env` file in the `client` directory with the following variables:

```env
REACT_APP_API_URL=http://localhost:5000 # Your backend API URL
REACT_APP_WEBSOCKET_URL=http://localhost:5000 # Your backend WebSocket URL (usually same as API)
```

**Run the Frontend:**

```bash
npm start # or yarn start
```

The frontend development server will start on `http://localhost:3000` (or another available port) and open in your browser.

## Usage Guide

1.  **Register/Login:** Navigate to the `/register` or `/login` paths. Create a new account or log in with existing credentials.
2.  **Kanban Board:** Once logged in, you'll be redirected to the main To-Do Board.
      * **Add Task:** Use the form (if any) or a dedicated button to create new tasks.
      * **Edit Task:** Click on a task to view/edit its details (title, description, assigned user, priority).
      * **Change Status:** Drag and drop tasks between "Todo," "In Progress," and "Done" columns.
      * **Reassign Task:** Drag a task to a different user's designated area (if implemented this way) or use the edit modal to change the assigned user.
      * **Smart Assign:** Click the "Smart Assign" button on a task to automatically assign it to the least burdened user.
      * **Conflict Resolution:** If you attempt to save changes to a task that has been modified by another user concurrently, a dialog will appear prompting you to resolve the conflict by either merging or overwriting.
3.  **Activity Log:** Observe the real-time updates in the "Activity Log" panel as tasks are added, edited, deleted, or assigned by any user.

## Explanations for Unique Logic

### Smart Assign Logic

The "Smart Assign" functionality is a backend-driven process. When a user clicks the "Smart Assign" button for a particular task on the frontend, an API request is sent to a dedicated backend endpoint.

On the backend, the following steps occur:

1.  All registered users are retrieved from the database.
2.  For each user, the system queries the database to count the number of tasks currently assigned to them that are **not** in the "Done" status (i.e., "Todo" or "In Progress").
3.  The user with the minimum count of such "active" tasks is identified.
4.  The specific task for which "Smart Assign" was triggered is then updated in the database, with its `assignedTo` field set to the ID of the identified "least burdened" user.
5.  Finally, a WebSocket event is broadcast to all connected clients, ensuring the change is reflected in real-time on everyone's board. This ensures fair distribution of work based on current load.

### Conflict Handling Logic

Our conflict handling mechanism employs **Optimistic Locking** on the backend and a **User-Assisted Resolution** strategy on the frontend.

**Backend (Optimistic Locking):**

1.  Every task document in the MongoDB database includes a `version` field (an integer or timestamp).
2.  When a user fetches a task for editing, the frontend receives the task's current data along with its `version`.
3.  When the user submits their edited task back to the backend, the backend's update query includes a condition to only update the task *if its current `version` in the database matches the `version` sent by the frontend*.
4.  If the versions match, the task is updated, its `version` is incremented, and a real-time update is broadcast via WebSockets.
5.  If the versions *do not* match, it means another user has already modified and saved the task since the current user fetched it. In this case, the backend's update operation fails, and it sends a specific conflict error response to the frontend.

**Frontend (User-Assisted Resolution):**

1.  Upon receiving a conflict error from the backend, the frontend does not proceed with the user's unsaved changes.
2.  Instead, it immediately fetches the absolute latest version of the conflicting task from the server.
3.  A dedicated "Conflict Resolution" modal or UI element is displayed to the user. This interface presents:
      * "Your Changes": The data the user attempted to save.
      * "Current Server Version": The latest, conflicting data from the database.
4.  The user is given two options:
      * **"Overwrite"**: If selected, the frontend re-sends the user's original changes to the backend, explicitly overriding the `version` check (or attempting the update without the version check, ensuring it takes precedence). This will overwrite the other user's changes.
      * **"Merge"**: If selected, the user is typically presented with editable fields pre-filled with the current server version. They can then manually combine their unsaved changes with the server's current data as they see fit. Once they are satisfied, they re-submit this new combined version, which will then pass the optimistic lock check (as they are now working with the latest server version). This option emphasizes human judgment for complex reconciliation.

This approach ensures data integrity while providing a clear path for users to manage concurrent modifications.

-----

**Environment Variable Setup for Deployment:**

When deploying, ensure you configure the following environment variables in your chosen hosting services. **Do NOT commit `.env` files to your repository\!**

**Backend (e.g., Render, Railway):**

  * `PORT`
  * `MONGODB_URI`
  * `JWT_SECRET`
  * `FRONTEND_URL` (Set this to your *deployed* frontend URL)

**Frontend (e.g., Vercel, Netlify):**

  * `REACT_APP_API_URL` (Set this to your *deployed* backend API URL)
  * `REACT_APP_WEBSOCKET_URL` (Set this to your *deployed* backend WebSocket URL)

