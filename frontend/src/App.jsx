import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from './pages/Register';
import Login from './pages/Login';
import Home from "./pages/Home";
import InstructorDashboard from "./pages/dashboards/Instructor";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/dashboards/Admin";
import CourseBuilder from "./components/instructor/CourseBuilder";
import InstructorSettings from "./components/instructor/InstructorSettings";
import StudentDashboard from "./pages/dashboards/Student";
import CourseViewer from "./components/student/CourseEnrollment";
import EditCourse from "./components/instructor/EditCourse";
import ExploreCourses from "./components/student/ExploreCourses";
import Certificates from "./components/student/Certificates";
import MyReviews from "./components/student/MyReviews";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login/>} />
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/instructor/dashboard" element={<InstructorDashboard/>} />
        <Route path="/instructor/create-course" element={<CourseBuilder />} />
        <Route path="/instructor/settings" element={<InstructorSettings/>} />
        <Route path="/student/dashboard" element={<StudentDashboard/>} />
        {/* <Route path="/student/course-viewer/:courseId" element={<CourseViewer />} /> */}
        <Route path="/instructor/edit-course/:id" element={<EditCourse />} />
        <Route path="/student/dashboard" element={<ProtectedRoute allowedRole="STUDENT"><StudentDashboard /></ProtectedRoute>} />
{/* <Route path="/student/explore" element={<ProtectedRoute allowedRole="STUDENT"><ExploreCourses /></ProtectedRoute>} />
<Route path="/student/certificates" element={<ProtectedRoute allowedRole="STUDENT"><Certificates /></ProtectedRoute>} />
<Route path="/student/reviews" element={<ProtectedRoute allowedRole="STUDENT"><MyReviews /></ProtectedRoute>} /> */}
<Route path="/student/course-viewer/:courseId" element={<ProtectedRoute allowedRole="STUDENT"><CourseViewer /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;