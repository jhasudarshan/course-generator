import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import useCourseStore from '../store/CourseStore';
import ModuleSidebar from './ModuleSidebar';
import ModuleContent from './ModuleContent';
import './CourseDetail.css';

function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const {
    currentCourse,
    activeModuleIndex,
    coursesLoading,
    coursesError,
    fetchCourseDetails
  } = useCourseStore();
  
  useEffect(() => {
    fetchCourseDetails(courseId);
  }, [courseId, fetchCourseDetails]);
  
  // Handle back button
  const handleBack = () => {
    navigate('/');
  };
  
  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  if (coursesLoading) return (
    <div className="loading-state">
      <div className="loading-spinner"></div>
      <p>Loading course content...</p>
    </div>
  );
  
  if (coursesError) return (
    <div className="error-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <h3>Error Loading Course</h3>
      <p>{coursesError}</p>
      <button className="back-button" onClick={handleBack}>Return to Course List</button>
    </div>
  );
  
  if (!currentCourse) return (
    <div className="error-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="8" y1="12" x2="16" y2="12"></line>
      </svg>
      <h3>Course Not Found</h3>
      <p>The requested course could not be found.</p>
      <button className="back-button" onClick={handleBack}>Return to Course List</button>
    </div>
  );
  
  return (
    <div className="course-detail">
      <div className="course-header">
        <div className="header-main">
          <button className="back-button" onClick={handleBack}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Back to Courses</span>
          </button>
          
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
            <span>Modules</span>
          </button>
        </div>
        
        <h2 className="course-title">{currentCourse.title}</h2>
        
        <div className="course-description">
          <ReactMarkdown>{currentCourse.description}</ReactMarkdown>
        </div>
        
        <div className="course-meta-details">
          {currentCourse.difficulty && (
            <span className="meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18"></path>
                <path d="M6 6l12 12"></path>
              </svg>
              Level: {currentCourse.difficulty}
            </span>
          )}
          
          {currentCourse.audience && (
            <span className="meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Audience: {currentCourse.audience}
            </span>
          )}
          
          {currentCourse.topic && (
            <span className="meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
              Topic: {currentCourse.topic}
            </span>
          )}
          
          {currentCourse.language && (
            <span className="meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              Language: {currentCourse.language}
            </span>
          )}
          
          {currentCourse.created_by && (
            <span className="meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Created by: {currentCourse.created_by}
            </span>
          )}
        </div>
        
        <div className="course-progress">
          {currentCourse.modules && (
            <div className="progress-container">
              <div className="progress-text">
                <span>Course Progress</span>
                <span>{activeModuleIndex + 1}/{currentCourse.modules.length} modules</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${((activeModuleIndex + 1) / currentCourse.modules.length) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="course-content">
        <div className={`sidebar-container ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-overlay" onClick={toggleSidebar}></div>
          <ModuleSidebar closeSidebar={() => setSidebarOpen(false)} />
        </div>
        <ModuleContent />
      </div>
    </div>
  );
}

export default CourseDetail;



// import { useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import ReactMarkdown from 'react-markdown';
// import useCourseStore from '../../store/CourseStore';
// import ModuleSidebar from './ModuleSidebar';
// import ModuleContent from './ModuleContent';
// import './CourseDetail.css';

// function CourseDetail() {
//   const { courseId } = useParams();
//   const navigate = useNavigate();
//   const { 
//     currentCourse, 
//     activeModuleIndex, 
//     coursesLoading, 
//     coursesError, 
//     fetchCourseDetails 
//   } = useCourseStore();

//   useEffect(() => {
//     fetchCourseDetails(courseId);
//   }, [courseId]);

//   // Handle back button
//   const handleBack = () => {
//     navigate('/');
//   };

//   if (coursesLoading) return <div className="loading">Loading course content...</div>;
//   if (coursesError) return <div className="error">Error: {coursesError}</div>;
//   if (!currentCourse) return <div className="error">Course not found</div>;

//   return (
//     <div className="course-detail">
//       <div className="course-header">
//         <button className="back-button" onClick={handleBack}>← Back to Courses</button>
//         <h2>{currentCourse.title}</h2>
//         <div className="course-description">
//           <ReactMarkdown>{currentCourse.description}</ReactMarkdown>
//         </div>
//         <div className="course-meta-details">
//           {currentCourse.difficulty && <span className="meta-item">Level: {currentCourse.difficulty}</span>}
//           {currentCourse.audience && <span className="meta-item">Audience: {currentCourse.audience}</span>}
//           {currentCourse.topic && <span className="meta-item">Topic: {currentCourse.topic}</span>}
//           {currentCourse.language && <span className="meta-item">Language: {currentCourse.language}</span>}
//           {currentCourse.created_by && <span className="meta-item">Created by: {currentCourse.created_by}</span>}
//         </div>
//       </div>
      
//       <div className="course-content">
//         <ModuleSidebar />
//         <ModuleContent />
//       </div>
//     </div>
//   );
// }

// export default CourseDetail;