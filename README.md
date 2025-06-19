# Task Manager Application

A modern, full-stack task management application built with the MERN stack (MongoDB, Express.js, React.js, Node.js). This intuitive task manager lets you organize your work, collaborate with team members, and boost your productivity.

## Live Demo

Check out the live application: [Task Manager Live Demo](https://task-manager-urfe.onrender.com)

## Features

### User Authentication & Profile Management
- **Secure Authentication**: Email and password-based authentication with JWT
- **User Registration**: Create an account with name, email, and password
- **User Profiles**: View and update user information
- **Password Management**: Securely change passwords
- **Account Deletion**: Option to delete user account

### Task Management
- **Create Tasks**: Add new tasks with title, description, due date, priority, and status
- **Task List View**: View all tasks in an organized list
- **Task Details**: Click on tasks to view and edit all details
- **Task Status**: Mark tasks as "To Do", "In Progress", or "Completed"
- **Priority Levels**: Set task priorities as "Low", "Medium", or "High"
- **Due Dates**: Set and track task deadlines
- **Drag and Drop**: Reorder tasks and change status by dragging tasks between columns

### Task Organization & Filtering
- **Search Tasks**: Find tasks quickly with keyword search
- **Filter by Status**: Filter tasks by their completion status
- **Filter by Priority**: Focus on high-priority tasks when needed
- **Tag System**: Create and assign tags to categorize tasks
- **Tag Filtering**: Filter tasks by their assigned tags

### Collaboration Features
- **Task Sharing**: Share tasks with other users
- **Permission Management**: Set view or edit permissions for shared tasks
- **Access Control**: View who has access to your tasks
- **Revoke Access**: Remove user access to shared tasks

### Data Export
- **CSV Export**: Export your tasks to CSV format
- **PDF Export**: Generate PDF reports of your tasks

### UI/UX Features
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Intuitive Interface**: Clean and easy-to-use interface
- **Real-time Feedback**: Meaningful notifications and messages
- **Theme Support**: Light and dark theme options
- **Loading States**: Visual indicators for loading states

## Prerequisites

Before you begin, make sure you have the following installed:
- [Node.js](https://nodejs.org/) (latest)
- [npm](https://www.npmjs.com/) (latest)
- [MongoDB](https://www.mongodb.com/) (latest)

## Installation

### Clone the Repository

```bash
git clone https://github.com/yourusername/task-manager.git
cd task-manager
```

### Set Up the Backend

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the server directory with the following variables:
```
PORT=4000
MONGO_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your_secure_jwt_secret_key
NODE_ENV=development
```

4. Start the server:
```bash
npm run dev
```

The server should now be running on `http://localhost:4000`.

### Set Up the Frontend

1. Open a new terminal and navigate to the client directory:
```bash
cd ../client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the client directory:
```
REACT_APP_API_URL=http://localhost:4000/api
```

4. Start the React application:
```bash
npm start
```

The application should now be running on `http://localhost:3000`.

## Running Tests

### Backend Tests

```bash
cd server
npm test
```

### Frontend Tests

```bash
cd client
npm test
```

## Project Structure

```
task-manager/
├── client/                  # React frontend
│   ├── public/              # Public assets
│   ├── src/                 # Source code
│   │   ├── components/      # React components
│   │   ├── context/         # Context API files
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   ├── utils/           # Utility functions
│   │   ├── App.js           # App component
│   │   └── index.js         # Entry point
│   └── package.json         # Frontend dependencies
│
├── server/                  # Express backend
│   ├── config/              # Configuration files
│   ├── controllers/         # API controllers
│   ├── middleware/          # Custom middleware
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   ├── utils/               # Utility functions
│   ├── server.js            # Server entry point
│   └── package.json         # Backend dependencies
│
├── .gitignore               # Git ignore file
└── README.md                # Project documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user

### Users
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `PUT /api/profile/password` - Update password
- `DELETE /api/profile` - Delete user account

### Tasks
- `GET /api/tasks` - Get all tasks for the user
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Get a specific task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `PUT /api/tasks/:id/status` - Update task status
- `PUT /api/tasks/:id/order` - Update task order (for drag and drop)
- `GET /api/tasks/export` - Export tasks (CSV or PDF)

### Task Sharing
- `POST /api/tasks/:id/share` - Share a task
- `POST /api/tasks/:id/unshare` - Revoke task access
- `GET /api/tasks/shared` - Get tasks shared with the user

## Authentication

The application uses JWT (JSON Web Tokens) for authentication:

1. When a user registers or logs in, the server generates a JWT token
2. This token is stored in the client's session storage
3. The token is sent with every request to authenticated endpoints
4. The server validates the token before processing requests

## Key Technologies

### Frontend
- **React.js**: UI library
- **React Router**: Routing
- **Context API**: State management
- **Axios**: API requests
- **CSS Modules**: Component styling
- **React Beautiful DnD**: Drag and drop functionality

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB ODM
- **JWT**: Authentication
- **Bcrypt**: Password hashing
- **PDFKit**: PDF generation
- **csv-writer**: CSV export

## Browser Support

The application supports all modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Tools

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Jest**: Testing framework
- **React Testing Library**: Component testing
- **Nodemon**: Server auto-restart during development

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

If you have any questions or need help, please open an issue on GitHub

## Acknowledgments

- [MongoDB](https://www.mongodb.com/) for the powerful database
- [Express.js](https://expressjs.com/) for the backend framework
- [React.js](https://reactjs.org/) for the frontend library
- [Node.js](https://nodejs.org/) for the JavaScript runtime

---

Happy task managing!
