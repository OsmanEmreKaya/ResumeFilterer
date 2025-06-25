import './App.css';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import LoginPage from './pages/Login';
import StartPage from './pages/StartPage';
import UploadResume from './pages/UploadResume';
import Navbar from './components/Navbar';
import Resumes from './pages/Resumes';
import ResumeDetails from './pages/ResumeDetails';
import backgroundImage from './assets/blue-neon-color-gradient-horizontal-background-with-copy-space_356877-1135.jpg'; // Import the background image
import Email from './pages/Email';
import Logout from './pages/Logout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StartPage />} /> 
        <Route path="/login" element={<LoginPageLayout />} />
        <Route path="/upload-resume" element={<UploadResume />} /> 
        <Route path="/resumes" element={<Resumes />} /> 
        <Route path="/resume-details/:id" element={<ResumeDetails />} /> 
        <Route path="/email" element={<Email />} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </BrowserRouter>
  );
}

// LoginPageLayout component to wrap login page elements
function LoginPageLayout() {
  return (
    <>
      <Navbar />
      <div
        className="relative min-h-full h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }} // Apply the background image
      >
        {/* Overlay for opacity */}
        <div className="absolute inset-0 bg-white opacity-80"></div> 

        {/* Content */}
        <div className="relative max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
          <LoginPage />
        </div>
      </div>
      <footer className="bg-black text-white py-4">
        <div className="container mx-auto text-center">
          <p>&copy; Internship Project by Osman Emre Kaya</p>
        </div>
      </footer>
    </>
  );
}

export default App;
