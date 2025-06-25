import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoggedOnNavbar from '../components/LoggedOnNavbar';
import axios from 'axios';

const Resumes = () => {
  // State management
  const [resumes, setResumes] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    professions: [],
    locations: [],
    keyskills: []
  });
  const [filters, setFilters] = useState({
    profession: '',
    location: '',
    keyskills: [],
    experienceyear: 'All'
  });
  const [selectedResumes, setSelectedResumes] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isSendEmailVisible, setIsSendEmailVisible] = useState(false);
  const [isDeleteVisible, setIsDeleteVisible] = useState(false); // New state for delete button
  const [isKeySkillsOpen, setIsKeySkillsOpen] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is logged in
    const userId = localStorage.getItem('iduser');
    if (!userId || userId === '0') {
      // Redirect to the start or login page if user is not logged in
      navigate('/');
    }
  }, [navigate]);

  // Fetch resumes and filter options on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('iduser'); // Get iduser from local storage

        const [resumesResponse, optionsResponse] = await Promise.all([
          axios.get(`http://localhost:8081/resumes?userId=${userId}`), // Pass iduser as query parameter
          axios.get('http://localhost:8081/filter-options')
        ]);

        if (resumesResponse.data.success) {
          setResumes(resumesResponse.data.resumes);
        } else {
          console.error('Failed to fetch resumes');
        }

        if (optionsResponse.data.success) {
          const { professions, locations, keyskills } = optionsResponse.data.options;
          setFilterOptions({
            professions,
            locations,
            keyskills
          });
        } else {
          console.error('Failed to fetch filter options');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);
  
  // Handle changes in filter selections
  const handleFilterChange = (name, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  // Handle changes in key skills checkboxes
  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFilters(prevFilters => {
      const newKeyskills = checked
        ? [...prevFilters.keyskills, value]
        : prevFilters.keyskills.filter(skill => skill !== value);
      return { ...prevFilters, keyskills: newKeyskills };
    });
  };

  // Toggle the visibility of key skills selection
  const toggleKeySkills = () => {
    setIsKeySkillsOpen(!isKeySkillsOpen);
  };

  // Navigate to the resume details page
  const handleViewResume = (id) => {
    navigate(`/resume-details/${id}`);
  };

  // Toggle selection mode and show/hide action buttons
  const handleSelectClick = () => {
    setIsSelecting(!isSelecting);
    setIsSendEmailVisible(!isSelecting); // Show/Hide the "Send Email" button
    setIsDeleteVisible(!isSelecting);    // Show/Hide the "Delete" button
    if (!isSelecting) {
      // Clear selections when selection mode is closed
      setSelectedResumes([]);
    }
  };

  // Handle the selection or deselection of a resume
  const handleResumeSelection = (id) => {
    setSelectedResumes(prevSelected => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter(resumeId => resumeId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  // Handle sending emails to selected resumes
  const handleSendEmail = async () => {
    try {
      const selectedResumeDetails = resumes.filter(resume => selectedResumes.includes(resume.idresumesum));
      
      // Fetch email template
      const templateResponse = await axios.get('http://localhost:8081/getTemplate');
      if (!templateResponse.data.success) {
        alert('Failed to fetch email template.');
        return;
      }
      const emailTemplate = templateResponse.data.template;

      // Customize the email as needed. For simplicity, using a static subject and template.
      const emailSubject = 'Regarding Your Application';
      const emailText = emailTemplate;

      // Extract emails from selected resumes
      const recipientEmails = selectedResumeDetails.map(resume => resume.email);

      // Send email request to backend
      const response = await axios.post('http://localhost:8081/send-email', {
        to: recipientEmails,
        subject: emailSubject,
        text: emailText
      });

      if (response.data.success) {
        alert('Emails sent successfully!');
        // Optionally, you can clear selections after sending emails
        setSelectedResumes([]);
        setIsSelecting(false);
        setIsSendEmailVisible(false);
        setIsDeleteVisible(false);
      } else {
        alert('Failed to send emails.');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('An error occurred while sending emails.');
    }
  };

  // Handle deleting selected resumes
  const handleDeleteResumes = async () => {
    if (!window.confirm('Are you sure you want to delete the selected resumes? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await axios.post('http://localhost:8081/delete-resumes', {
        ids: selectedResumes
      });

      if (response.data.success) {
        alert('Resumes deleted successfully!');
        // Update the resumes state by removing the deleted resumes
        setResumes(prevResumes => prevResumes.filter(resume => !selectedResumes.includes(resume.idresumesum)));
        // Clear selections and exit selection mode
        setSelectedResumes([]);
        setIsSelecting(false);
        setIsSendEmailVisible(false);
        setIsDeleteVisible(false);
      } else {
        alert('Failed to delete resumes.');
      }
    } catch (error) {
      console.error('Error deleting resumes:', error);
      alert('An error occurred while deleting resumes.');
    }
  };

  // Filter resumes based on selected filters
  const filteredResumes = resumes.filter(resume => {
    const { experienceyear } = filters;
    let experienceMatch = true;

    if (experienceyear === '+2 years') {
      experienceMatch = resume.experienceyear >= 2;
    } else if (experienceyear === '+5 years') {
      experienceMatch = resume.experienceyear >= 5;
    } else if (experienceyear === '+10 years') {
      experienceMatch = resume.experienceyear >= 10;
    }

    return (
      (filters.profession === '' || resume.profession === filters.profession) &&
      (filters.location === '' || resume.location === filters.location) &&
      (filters.keyskills.length === 0 || filters.keyskills.every(skill => resume.keyskills.includes(skill))) &&
      (experienceyear === 'All' || experienceMatch)
    );
  });

  return (
    <>
      <LoggedOnNavbar />
      <div className="min-h-screen bg-gray-100 p-6">
        {/* Filtering Section */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-wrap gap-4">
            {/* Profession Filter */}
            <select
              name="profession"
              value={filters.profession}
              onChange={(e) => handleFilterChange(e.target.name, e.target.value)}
              className="p-2 border rounded-lg w-full md:w-auto flex-1"
            >
              <option value="">Select Profession</option>
              {filterOptions.professions.map((profession, index) => (
                <option key={index} value={profession}>{profession}</option>
              ))}
            </select>

            {/* Location Filter */}
            <select
              name="location"
              value={filters.location}
              onChange={(e) => handleFilterChange(e.target.name, e.target.value)}
              className="p-2 border rounded-lg w-full md:w-auto flex-1"
            >
              <option value="">Select Location</option>
              {filterOptions.locations.map((location, index) => (
                <option key={index} value={location}>{location}</option>
              ))}
            </select>

            {/* Key Skills Filter */}
            <div className="flex-1">
              <button
                type="button"
                onClick={toggleKeySkills}
                className="p-2 border rounded-lg bg-white text-black w-full md:w-auto"
              >
                {isKeySkillsOpen ? 'Hide' : 'Select'} Key Skills
              </button>
              {isKeySkillsOpen && (
                <div className="flex flex-col gap-2 mt-2 max-h-48 overflow-y-auto border p-2 rounded-lg bg-gray-50">
                  {filterOptions.keyskills.map((skill, index) => (
                    <label key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        value={skill}
                        checked={filters.keyskills.includes(skill)}
                        onChange={handleCheckboxChange}
                        className="mr-2"
                      />
                      {skill}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Experience Year Filter */}
            <select
              name="experienceyear"
              value={filters.experienceyear}
              onChange={(e) => handleFilterChange(e.target.name, e.target.value)}
              className="p-2 border rounded-lg w-full md:w-auto flex-1"
            >
              <option value="All">Years of Experience</option>
              <option value="+2 years">+2 years</option>
              <option value="+5 years">+5 years</option>
              <option value="+10 years">+10 years</option>
            </select>
          </div>
        </div>

        {/* Action Buttons: Select, Send Email, Delete */}
        <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
          <button
            className="bg-blue-500 text-white p-2 rounded-lg"
            onClick={handleSelectClick}
          >
            {isSelecting ? 'Cancel Selection' : 'Select'}
          </button>

          {/* Action Buttons Container */}
          <div className="flex flex-wrap gap-2">
            {isSendEmailVisible && (
              <button
                className={`p-2 bg-green-500 text-white rounded-lg ${selectedResumes.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleSendEmail}
                disabled={selectedResumes.length === 0}
              >
                Send Email
              </button>
            )}

            {isDeleteVisible && (
              <button
                className={`p-2 bg-red-500 text-white rounded-lg ${selectedResumes.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleDeleteResumes}
                disabled={selectedResumes.length === 0}
              >
                Delete Selected
              </button>
            )}
          </div>
        </div>

        {/* Resumes List */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          {filteredResumes.length === 0 ? (
            <div className="text-center text-gray-500">No resumes found.</div>
          ) : (
            filteredResumes.map((resume) => (
              <div
                key={resume.idresumesum}
                className={`border p-4 rounded-lg mb-4 flex justify-between items-center ${isSelecting ? 'cursor-pointer' : 'cursor-default'}`}
                onClick={isSelecting ? () => handleResumeSelection(resume.idresumesum) : null}
              >
                <div className="flex items-center">
                  {isSelecting && (
                    <input
                      type="checkbox"
                      checked={selectedResumes.includes(resume.idresumesum)}
                      onChange={() => handleResumeSelection(resume.idresumesum)}
                      className="mr-2"
                      onClick={(e) => e.stopPropagation()} // Prevent checkbox click from triggering parent onClick
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-bold text-lg">{resume.name}</div>
                    <div className="text-sm text-gray-600">Phone: {resume.phonenum}</div>
                    <div className="text-sm text-gray-600">Email: {resume.email}</div>
                    <div className="text-sm text-gray-600">Profession: {resume.profession}</div>
                    <div className="text-sm text-gray-600">
                      Key Skills: {Array.isArray(resume.keyskills) ? resume.keyskills.join(', ') : resume.keyskills}
                    </div>
                    <div className="text-sm text-gray-600">Experience: {resume.experienceyear} {resume.experienceyear === 1 ? 'year' : 'years'}</div>
                  </div>
                </div>
                {!isSelecting && (
                  <button
                    className="ml-4 p-2 bg-blue-500 text-white rounded-lg"
                    onClick={() => handleViewResume(resume.idresumesum)}
                  >
                    View
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Resumes;
