import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useCourseStore from '../store/CourseStore';
import { ArrowLeft, BookOpen, Award, Languages, FileText, Loader2, Sparkles } from 'lucide-react';
import './CourseCreationPage.css';

function CourseCreationPage() {
  const navigate = useNavigate();
  const {
    generateCourse,
    generationLoading,
    generationError,
    generationJobId,
    generationSuccessRedirect,
    clearGenerationState
  } = useCourseStore();

  const [formData, setFormData] = useState({
    topic: '',
    description: '',
    difficulty: 'Beginner',
    language: 'English',
  });

  const [redirectCountdown, setRedirectCountdown] = useState(null);
  const [animateSubmit, setAnimateSubmit] = useState(false);

  // Handle form field changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Handle auto-growing textarea
  const handleTextareaChange = (e) => {
    const textarea = e.target;
    handleChange(e);

    // Reset height to auto to properly calculate new height
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  useEffect(() => {
    if (generationSuccessRedirect && !redirectCountdown) {
      setRedirectCountdown(3);

      const timer = setInterval(() => {
        setRedirectCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate(generationSuccessRedirect);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [generationSuccessRedirect, redirectCountdown, navigate]);

  useEffect(() => {
    return () => {
      clearGenerationState();
    };
  }, [clearGenerationState]);

  const handleSubmit = () => {
    setAnimateSubmit(true);
    generateCourse(formData);

    // Reset animation state after animation completes
    setTimeout(() => setAnimateSubmit(false), 500);
  };

  const handleCancel = () => {
    navigate('/courses');
  };

  const isFormValid = formData.topic.trim() !== '';

  return (
    <div className="course-creation-page">
      <div className="background-decoration">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
      </div>

      <div className="page-container">
        <div className="creator-header">
          <div className="creator-header-left">
            <div className="creator-icon-wrapper">
              <Sparkles className="creator-icon" />
            </div>
            <div>
              <h1 className="creator-title">Course Creator</h1>
              <p className="creator-subtitle">Design your perfect educational journey</p>
            </div>
          </div>

          <button onClick={handleCancel} className="back-button" aria-label="Go back">
            <ArrowLeft className="back-button-icon" />
            <span>Back to Courses</span>
          </button>
        </div>

        {!generationJobId ? (
          <div className="form-container">
            <div className="form-header">
              <h2 className="form-title">Create Your Custom Course</h2>
              <p className="form-description">Fill in the details below to generate a tailored learning experience</p>
            </div>

            <div className="form-fields">
              <div className="form-group">
                <label htmlFor="topic" className="form-label">
                  Course Topic <span className="required-asterisk">*</span>
                </label>
                <div className={`input-wrapper ${formData.topic ? 'has-value' : ''}`}>
                  <BookOpen className="input-icon" />
                  <input
                    type="text"
                    id="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter course topic"
                    required
                  />
                </div>
              </div>

              <div className="form-group description-group">
                <label htmlFor="description" className="form-label">Course Description</label>
                <div className={`input-wrapper ${formData.description ? 'has-value' : ''}`}>
                  <FileText className="input-icon" />
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={handleTextareaChange}
                    className="form-textarea"
                    placeholder="Describe what your course will cover"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="difficulty" className="form-label">Difficulty Level</label>
                <div className="input-wrapper">
                  <Award className="input-icon" />
                  <select
                    id="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="language" className="form-label">Language</label>
                <div className="input-wrapper">
                  <Languages className="input-icon" />
                  <select
                    id="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Bengali">Bengali</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="Mandarin">Mandarin</option>
                  </select>
                </div>
              </div>
            </div>

            {generationError && (
              <div className="error-message">
                <svg xmlns="http://www.w3.org/2000/svg" className="error-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {generationError}
              </div>
            )}

            <div className="form-actions">
              <button
                onClick={handleCancel}
                className="cancel-button"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={generationLoading || !isFormValid}
                className={`generate-button ${animateSubmit ? 'button-pulse' : ''}`}
                type="button"
              >
                {generationLoading ? (
                  <>
                    <Loader2 className="spinner-icon" />
                    <span>Generating...</span>
                  </>
                ) : (
                  'Generate Course Outline'
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="generation-status">
            <div className="status-bg"></div>
            <div className={`status-icon ${generationSuccessRedirect ? 'success' : ''}`}>
              {generationSuccessRedirect ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <Loader2 className="spinner-icon large" />
              )}
            </div>
            <h3 className="status-title">
              {generationSuccessRedirect
                ? 'Course Generation Complete!'
                : 'Course Generation Started!'}
            </h3>
            <p className="status-message">
              {generationSuccessRedirect
                ? 'Your course outline is ready to view.'
                : 'Your course is being generated in the background.'}
            </p>
            <p className="job-id">Job ID: {generationJobId}</p>
            {generationSuccessRedirect && (
              <p className="redirect-message">
                Redirecting to courses page in {redirectCountdown} seconds...
              </p>
            )}
            {generationError && (
              <div className="error-message generation-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="error-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {generationError}
              </div>
            )}
          </div>
        )}

        <div className="footer">
          <p className="footer-text">
            © 2025 Course Creator Platform. All course outlines are customizable.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CourseCreationPage;