import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';


function CourseCreationPage() {
  const [topic, setTopic] = useState('Introduction to Python Programming');
  const [audience, setAudience] = useState('Beginners with no prior coding experience');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [language, setLanguage] = useState('English');
  const [outcome, setOutcome] = useState('Understand basic Python syntax and write simple programs');
  const [duration, setDuration] = useState('4 weeks');
  const [tone, setTone] = useState('Enthusiastic and encouraging');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  
  const navigate = useNavigate();
  
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Format input as required by the API
      const formattedInput = {
        topic: topic || "",
        audience: audience || "",
        difficulty: difficulty || "",
        language: language || "",
        outcome: outcome || "", // This needs to be outcome as per your form
        duration: duration || "",
        tone: tone || ""
      };
      
      const response = await fetch('/api/generate-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedInput),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate course');
      }
      
      const data = await response.json();
      setJobId(data.job_id);
      setJobStatus(data.status);
      
      // After 3 seconds, redirect to the courses page
      setTimeout(() => {
        navigate('/courses');
      }, 3000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/courses');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-indigo-600 py-6 px-8">
          <h1 className="text-2xl font-bold text-white">Course Creator</h1>
          <p className="text-indigo-100 mt-1">Build your custom educational experience</p>
        </div>
        
        {!jobId ? (
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Create Your Custom Course Outline</h2>
              <p className="text-gray-600">Fill in the details below to generate a comprehensive course plan</p>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Topic</label>
                  <input 
                    type="text" 
                    value={topic} 
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                  <input 
                    type="text" 
                    value={audience} 
                    onChange={(e) => setAudience(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <input 
                    type="text" 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Duration</label>
                  <input 
                    type="text" 
                    value={duration} 
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Desired Learning Outcomes</label>
                <textarea 
                  value={outcome} 
                  onChange={(e) => setOutcome(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teaching Tone</label>
                <input 
                  type="text" 
                  value={tone} 
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div className="pt-4 flex justify-between">
                <button 
                  onClick={handleCancel}
                  className="bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 shadow-md ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
                >
                  {loading ? 'Generating...' : 'Generate Course Outline'}
                </button>
              </div>
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
                  {error}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 text-indigo-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Course Generation Started!</h3>
            <p className="text-gray-600 mb-4">Your course is being generated in the background.</p>
            <p className="text-sm text-gray-500 mb-6">Job ID: {jobId}</p>
            <p className="text-indigo-600">Redirecting to courses page...</p>
          </div>
        )}
        
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            © 2025 Course Creator Platform. All course outlines are customizable.
          </p>
        </div>
      </div>
    </div>
  );
}