import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoggedOnNavbar from '../components/LoggedOnNavbar';
import axios from 'axios';

const UploadResume = () => {
  const [fileUploaded, setFileUploaded] = useState(false);
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is logged in
    const userId = localStorage.getItem('iduser');
    if (!userId || userId === '0') {
      // Redirect to the start or login page if user is not logged in
      navigate('/');
    }
  }, [navigate]);

  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      setFileUploaded(true);
      setFile(event.target.files[0]);
    } else {
      setFileUploaded(false);
    }
  };

  const handleSubmit = async () => {
    if (file) {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('userid', localStorage.getItem('iduser'));

      try {
        const response = await axios.post('http://localhost:8081/upload-resume', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.success) {
          const formattedSummary = response.data.summary
            .replace(/\*\*/g, '') // Remove any double asterisks
            .replace(/Name:/g, '<strong>Name:</strong>')
            .replace(/Location:/g, '<strong>Location:</strong>')
            .replace(/Email:/g, '<strong>Email:</strong>')
            .replace(/Phone number:/g, '<strong>Phone number:</strong>')
            .replace(/Profession:/g, '<strong>Profession:</strong>')
            .replace(/Key skills:/g, '<strong>Key skills:</strong>')
            .replace(/Certificates:/g, '<strong>Certificates:</strong>')
            .replace(/Education:/g, '<strong>Education:</strong>')
            .replace(/Experiences:/g, '<strong>Experiences:</strong>')
            .replace(/Years of experience:/g, '<strong>Years of experience:</strong>')
            .replace(/Additional Info:/g, '<strong>Additional Info:</strong>')
            .replace(/\n/g, '<br />');

          setSummary(formattedSummary);
        } else {
          alert('Error generating summary');
        }
      } catch (error) {
        console.error('Error uploading resume:', error.response ? error.response.data : error.message);
        alert('Error uploading resume');
      }
    }
  };

  return (
    <>
      <LoggedOnNavbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4 text-center">Welcome to Resume Filterer</h1>
        <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center justify-center w-full">
          <div className="w-full h-64 border border-black flex items-start justify-start mb-8 overflow-y-auto">
            {summary ? (
              <div className="text-gray-700 p-4 whitespace-pre-wrap w-full">
                <h2 className="text-xl font-bold mb-2">Summary:</h2>
                <div dangerouslySetInnerHTML={{ __html: summary }} />
              </div>
            ) : (
              <span className="text-gray-500">You didn't send me a resume yet!</span>
            )}
          </div>
          <div className="w-full h-12 border border-black flex items-center justify-center mb-4">
            <label className="text-black" htmlFor="upload-resume">
              Upload Your Resume Here
            </label>
            <input
              id="upload-resume"
              type="file"
              className="ml-2"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
          </div>
          {fileUploaded && (
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleSubmit}
            >
              Send
            </button>
          )}
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

export default UploadResume;
