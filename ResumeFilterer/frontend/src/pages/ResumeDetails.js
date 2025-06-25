import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoggedOnNavbar from '../components/LoggedOnNavbar';
import axios from 'axios';

const ResumeDetails = () => {
  const { id } = useParams(); // Extract the resume ID from the URL
  const navigate = useNavigate(); // Initialize useNavigate
  const [resume, setResume] = useState(null);

  useEffect(() => {
    // Check if the user is logged in
    const userId = localStorage.getItem('iduser');
    if (!userId || userId === '0') {
      // Redirect to the start or login page if user is not logged in
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    // Fetch the resume details from the backend using the ID
    axios.get(`http://localhost:8081/resumes/${id}`)
      .then(response => {
        if (response.data.success) {
          const sanitizedResume = {
            ...response.data.resume,
            name: response.data.resume.name.replace(/\*\*/g, ''),
            location: response.data.resume.location.replace(/\*\*/g, ''),
            phonenum: response.data.resume.phonenum.replace(/\*\*/g, ''),
            email: response.data.resume.email.replace(/\*\*/g, ''),
            profession: response.data.resume.profession.replace(/\*\*/g, ''),
            keyskills: response.data.resume.keyskills.replace(/\*\*/g, ''),
            certifications: response.data.resume.certifications.replace(/\*\*/g, ''),
            education: response.data.resume.education.replace(/\*\*/g, ''),
            experience: response.data.resume.experience.replace(/\*\*/g, ''),
            experienceyear: response.data.resume.experienceyear, // Ensure this field is properly fetched
            additionalinfo: response.data.resume.additionalinfo // Ensure this field is properly fetched
          };
          setResume(sanitizedResume);
        } else {
          console.error('Failed to fetch resume details');
        }
      })
      .catch(error => {
        console.error('Error fetching resume details:', error);
      });
  }, [id]);

  const handleBackClick = () => {
    navigate('/resumes'); // Navigate back to the resumes list
  };

  if (!resume) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <LoggedOnNavbar />
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">{resume.name}</h1>
          <div className="mb-2">
            <span className="font-semibold">Phone:</span> {resume.phonenum}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Email:</span> {resume.email}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Profession:</span> {resume.profession}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Education:</span> {resume.education}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Location:</span> {resume.location}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Experience Years:</span> {resume.experienceyear} years
          </div>
          <div className="mb-2">
            <span className="font-semibold">Key Skills:</span> {Array.isArray(resume.keyskills) ? resume.keyskills.join(', ') : resume.keyskills}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Certifications:</span> {resume.certifications}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Experience:</span>
            <ul className="list-disc pl-5">
              {resume.experience.split('\n').map((item, index) => (
                <li key={index}>{item.trim()}</li>
              ))}
            </ul>
          </div>
          <div className="mb-2">
            <span className="font-semibold">Additional Info:</span> {resume.additionalinfo}
          </div>
          <button
            className="mt-4 p-2 bg-blue-600 text-white rounded-lg"
            onClick={handleBackClick} // Go back to the resumes list
          >
            Back to Resumes
          </button>
        </div>
      </div>
      <footer className="bg-black text-white py-4">
        <div className="container mx-auto text-center">
          <p>&copy; Internship Project by Osman Emre Kaya</p>
        </div>
      </footer>
    </>
  );
};

export default ResumeDetails;
