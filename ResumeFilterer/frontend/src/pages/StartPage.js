import React from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/blue-neon-color-gradient-horizontal-background-with-copy-space_356877-1135.jpg'; // Correct relative path with extension

const StartPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }} 
    >
      <Navbar />

      <main>
        <section className="bg-white bg-opacity-80 py-12"> 
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Streamline Your Hiring Process</h2>
            <p className="text-lg text-gray-800 mb-8">Save time and focus on the best candidates by using AI to summarize and filter resumes.</p>
            <button
              onClick={handleGetStarted}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-500 transition duration-300"
            >
              Get Started
            </button>
          </div>
        </section>

        <section id="features" className="py-12 bg-white bg-opacity-80"> {/* Added bg-opacity for better readability */}
          <div className="container mx-auto text-center">
            <h3 className="text-3xl font-bold mb-6">Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-white rounded-lg shadow">
                <h4 className="text-2xl font-bold mb-2">Easy Filtering</h4>
                <p className="text-gray-600">Quickly filter through resumes and identify the most relevant candidates.</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow">
                <h4 className="text-2xl font-bold mb-2">AI-Powered Summarization</h4>
                <p className="text-gray-600">Summarize lengthy resumes into key points that matter most to your hiring process.</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow">
                <h4 className="text-2xl font-bold mb-2">Free Storage</h4>
                <p className="text-gray-600">Safely store all resumes in one place for easy access at all times.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-black text-white py-4">
        <div className="container mx-auto text-center">
          <p>&copy; Internship Project by Osman Emre Kaya</p>
        </div>
      </footer>
    </div>
  );
};

export default StartPage;
