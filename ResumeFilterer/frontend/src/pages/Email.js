import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoggedOnNavbar from '../components/LoggedOnNavbar';

const EmailTemplateEditor = () => {
  const [template, setTemplate] = useState("");
  const [isChanged, setIsChanged] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    const userId = localStorage.getItem('iduser');
    if (!userId || userId === '0') {
      // Redirect to the start page if not logged in
      navigate('/');
    } else {
      // Fetch initial template for the logged-in user
      axios
        .get(`http://localhost:8081/getTemplate/${userId}`)
        .then((response) => {
          if (response.data.success) {
            setTemplate(response.data.template);
          }
        })
        .catch((err) => {
          console.error("Error fetching template:", err);
        });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setTemplate(e.target.value);
    setIsChanged(true); // Enable the Save button when text is changed
  };

  const handleSave = () => {
    const userId = localStorage.getItem('iduser');
    axios
      .post('http://localhost:8081/saveTemplate', { template, userId })
      .then((response) => {
        if (response.data.success) {
          console.log("Template saved successfully");
          setIsChanged(false); // Disable the button after saving
          setSuccessMessage("Template saved successfully!");

          // Hide the success message after 3 seconds
          setTimeout(() => {
            setSuccessMessage("");
          }, 3000);
        }
      })
      .catch((error) => {
        console.error("Error saving template:", error);
      });
  };

  return (
    <>
      <LoggedOnNavbar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
        <h1 className="text-2xl font-bold mb-4">Your Email Template</h1>

        {/* Success message display */}
        {successMessage && (
          <div className="bg-green-500 text-white px-4 py-2 rounded-md mb-4">
            {successMessage}
          </div>
        )}

        <textarea
          value={template}
          onChange={handleChange}
          rows="20" // Adjust the number of rows for more height
          className="w-full border-2 border-gray-300 p-2 mb-4 rounded-md focus:outline-none focus:border-blue-500"
          placeholder="Write your email template here..."
        />
        <button
          onClick={handleSave}
          disabled={!isChanged}
          className={`${
            isChanged ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-300"
          } text-white font-bold py-2 px-4 rounded-md transition-colors duration-300`}
        >
          Save
        </button>
      </div>
      <footer className="bg-black text-white py-4">
        <div className="container mx-auto text-center">
          <p>&copy; Internship Project by Osman Emre Kaya</p>
        </div>
      </footer>
    </>
  );
};

export default EmailTemplateEditor;
