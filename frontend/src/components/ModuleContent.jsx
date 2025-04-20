import { useState } from 'react';
import YoutubeEmbed from './YoutubeEmbed';
import './ModuleContent.css';

function ModuleContent({ module }) {
  const [activeTab, setActiveTab] = useState('content');
  
  if (!module) return <div>Select a module to view content</div>;

  return (
    <div className="module-content">
      <h2 className="module-title">{module.module_title}</h2>
      
      <div className="module-tabs">
        <button 
          className={`tab ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          Lesson Content
        </button>
        <button 
          className={`tab ${activeTab === 'quiz' ? 'active' : ''}`}
          onClick={() => setActiveTab('quiz')}
        >
          Quiz
        </button>
        <button 
          className={`tab ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          Assignments
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'content' && (
          <div className="lesson-container">
            {module.objectives && module.objectives.length > 0 && (
              <div className="objectives">
                <h3>Learning Objectives</h3>
                <ul>
                  {module.objectives.map((objective, index) => (
                    <li key={index}>{objective}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="lesson-content">
              <div dangerouslySetInnerHTML={{ __html: module.lesson_content }} />
            </div>
            
            {module.youtube_data && (
              <div className="video-section">
                <h3>Video Resource</h3>
                <YoutubeEmbed videoInfo={module.youtube_data.video_info} />
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'quiz' && (
          <div className="quiz-container">
            <h3>Quiz Questions</h3>
            <div dangerouslySetInnerHTML={{ __html: module.quiz_questions }} />
          </div>
        )}
        
        {activeTab === 'assignments' && module.assignments && (
          <div className="assignments-container">
            <h3>Assignments</h3>
            <div dangerouslySetInnerHTML={{ __html: module.assignments }} />
          </div>
        )}
      </div>
    </div>
  );
}

export default ModuleContent;