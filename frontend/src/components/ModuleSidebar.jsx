import { useState } from 'react';
import useCourseStore from '../store/CourseStore';
import './ModuleSidebar.css';

function ModuleSidebar({ closeSidebar }) {
  const { currentCourse, activeModuleIndex, setActiveModuleIndex } = useCourseStore();
  const [expandedSections, setExpandedSections] = useState({});
  
  if (!currentCourse || !currentCourse.modules) return null;
  
  const toggleSection = (moduleIndex) => {
    setExpandedSections(prev => ({
      ...prev,
      [moduleIndex]: !prev[moduleIndex]
    }));
  };
  
  const handleModuleSelect = (index) => {
    setActiveModuleIndex(index);
    if (closeSidebar) closeSidebar();
  };
  
  return (
    <div className="module-sidebar">
      <div className="sidebar-header">
        <h3>Course Modules</h3>
        {closeSidebar && (
          <button className="close-sidebar" onClick={closeSidebar}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>
      
      <div className="modules-list">
        {currentCourse.modules.map((module, index) => (
          <div 
            key={index}
            className={`module-item ${activeModuleIndex === index ? 'active' : ''}`}
          >
            <div 
              className="module-header"
              onClick={() => handleModuleSelect(index)}
            >
              <div className="module-status">
                {activeModuleIndex > index ? (
                  <div className="status-icon completed">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                ) : activeModuleIndex === index ? (
                  <div className="status-icon current">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </div>
                ) : (
                  <div className="status-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="module-info">
                <span className="module-number">Module {index + 1}</span>
                <h4 className="module-name">{module.module_title}</h4>
                {module.duration && <span className="module-time">{module.duration}</span>}
              </div>
              
              <button 
                className={`expand-button ${expandedSections[index] ? 'expanded' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSection(index);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
            
            {expandedSections[index] && (
              <div className="module-topics">
                <div className="topic-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                  <span>Lesson Content</span>
                </div>
                
                <div className="topic-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  <span>Quiz</span>
                </div>
                
                {module.assignments && (
                  <div className="topic-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <span>Assignments</span>
                  </div>
                )}
                
                {module.resources && module.resources.length > 0 && (
                  <div className="topic-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span>Resources ({module.resources.length})</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ModuleSidebar;





// import useCourseStore from '../../store/CourseStore';
// import './ModuleSidebar.css';

// function ModuleSidebar() {
//   const { currentCourse, activeModuleIndex, setActiveModuleIndex } = useCourseStore();

//   if (!currentCourse || !currentCourse.modules) return null;

//   return (
//     <div className="module-sidebar">
//       <h3>Course Modules</h3>
//       <ul className="module-list">
//         {currentCourse.modules.map((module, index) => (
//           <li 
//             key={index} 
//             className={index === activeModuleIndex ? 'active' : ''}
//             onClick={() => setActiveModuleIndex(index)}
//           >
//             {module.module_title}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default ModuleSidebar;