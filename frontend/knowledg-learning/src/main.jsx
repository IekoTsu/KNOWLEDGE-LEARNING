/**
 * @fileoverview Application entry point that sets up React with context providers
 * and renders the root component.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { UserContextProvider } from './context/UserContext.jsx'
import { CourseContextProvider } from './context/CourseContext.jsx'
import { AdminContextProvider } from './context/AdminContext.jsx'
import App from './App.jsx'

/** @constant {string} server - Backend API URL from environment variables */
export const server = import.meta.env.VITE_BACKEND_URL;

/**
 * Renders the React application with all necessary context providers.
 * The providers are nested in the following order:
 * 1. UserContextProvider - Manages user authentication and data
 * 2. CourseContextProvider - Manages course-related state
 * 3. AdminContextProvider - Manages admin-specific functionality
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserContextProvider>
      <CourseContextProvider>
        <AdminContextProvider>
          <App/>
        </AdminContextProvider>
      </CourseContextProvider>
    </UserContextProvider>
  </StrictMode>,
)
