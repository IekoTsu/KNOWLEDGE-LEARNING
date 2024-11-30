import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { UserContextProvider } from './context/UserContext.jsx'
import { CourseContextProvider } from './context/CourseContext.jsx'
import { AdminContextProvider } from './context/AdminContext.jsx'
import App from './App.jsx'

export const server = "https://knowledge-learning.onrender.com";

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
