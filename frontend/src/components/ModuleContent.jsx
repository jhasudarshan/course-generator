import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import useCourseStore from '../store/CourseStore';
import './ModuleContent.css';

function ModuleContent() {
  const [activeTab, setActiveTab] = useState('content');
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showAnswers, setShowAnswers] = useState(false);

  const {
    currentCourse,
    activeModuleIndex,
    setActiveModuleIndex,
  } = useCourseStore();

  if (!currentCourse || !currentCourse.modules) return null;

  const module = currentCourse.modules[activeModuleIndex];

  if (!module) {
    return (
      <div className="module-content-empty">
        <div className="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
          <h3>Select a module to view content</h3>
          <p>Choose a module from the sidebar to start learning</p>
        </div>
      </div>
    );
  }

  const handleAnswerSelect = (questionNumber, option) => {
    setSelectedAnswers(prev => ({ ...prev, [questionNumber]: option }));
  };

  const renderQuizQuestions = () => {
    if (!module.quiz_questions?.length) return <p className="no-content">No quiz questions available for this module.</p>;

    return module.quiz_questions.map((question) => (
      <div key={question.number} className="quiz-question-card">
        <div className="question-header">
          <h4>Question {question.number}</h4>
          {showAnswers && (
            <span className="correct-answer-tag">
              Correct Answer: {question.correct}
            </span>
          )}
        </div>
        
        <div className="question-text">{question.text}</div>
        
        <div className="question-options">
          {Object.entries(question.options).map(([letter, text]) => (
            <label 
              key={letter}
              className={`option-label ${
                selectedAnswers[question.number] === letter ? 'selected' : ''
              } ${
                showAnswers && letter === question.correct ? 'correct' : ''
              }`}
            >
              <input
                type="radio"
                name={`question-${question.number}`}
                onChange={() => handleAnswerSelect(question.number, letter)}
                disabled={showAnswers}
              />
              <span className="option-letter">{letter}.</span>
              <span className="option-text">{text}</span>
            </label>
          ))}
        </div>

        {showAnswers && (
          <div className="question-explanation">
            <strong>Explanation:</strong> {question.explanation}
          </div>
        )}
      </div>
    ));
  };

  const renderAssignments = () => {
    if (!module.assignments?.sections?.length) return <p className="no-content">No assignments available for this module.</p>;

    return (
      <div className="assignment-sections">
        <div className="assignment-header">
          <h3>{module.assignments.title}</h3>
          <div className="total-marks">Total Marks: {module.assignments.total_marks}</div>
        </div>

        {module.assignments.sections.map((section, index) => (
          <div key={index} className="assignment-section">
            <div className="section-header">
              <h4>{section.type}</h4>
              <span className="marks-per-question">
                {section.marks_per_question} marks per question
              </span>
            </div>
            
            <ol className="section-questions">
              {section.questions.map((question, qIndex) => (
                <li key={qIndex} className="assignment-question">
                  <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                    {question}
                  </ReactMarkdown>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    );
  };    

  return (
    <div className="module-content">
      <div className="module-header">
        <h2 className="module-title">{module.module_title}</h2>
        {module.duration && <span className="module-duration">{module.duration}</span>}
      </div>

      <div className="module-tabs">
        <button className={`tab ${activeTab === 'content' ? 'active' : ''}`} onClick={() => setActiveTab('content')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
          <span>Lesson Content</span>
        </button>

        <button className={`tab ${activeTab === 'quiz' ? 'active' : ''}`} onClick={() => setActiveTab('quiz')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <span>Quiz</span>
        </button>

        {module.assignments && (
          <button className={`tab ${activeTab === 'assignments' ? 'active' : ''}`} onClick={() => setActiveTab('assignments')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>Assignments</span>
          </button>
        )}
      </div>

      <div className="tab-content">
        {activeTab === 'content' && (
          <div className="lesson-container">
            {/* VIDEO ABOVE */}
            {module.youtube_data && (
              <div className="video-section-card">
                <h3>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="23 7 16 12 23 17 23 7"></polygon>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                  </svg>
                  Video Resource
                </h3>
                <YoutubeEmbed videoInfo={module.youtube_data.video_info} />
              </div>
            )}

            {module.objectives && module.objectives.length > 0 && (
              <div className="objectives-card">
                <h3>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                    <line x1="6" y1="1" x2="6" y2="4"></line>
                    <line x1="10" y1="1" x2="10" y2="4"></line>
                    <line x1="14" y1="1" x2="14" y2="4"></line>
                  </svg>
                  Learning Objectives
                </h3>
                <ul className="objectives-list">
                  {module.objectives.map((obj, i) => (
                    <li key={i}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="lesson-content-card">
              <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                {module.lesson_content}
              </ReactMarkdown>
            </div>

            {module.resources && module.resources.length > 0 && (
              <div className="resources-card">
                <h3>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                  </svg>
                  Additional Resources
                </h3>
                <ul className="resources-list">
                  {module.resources.map((res, i) => (
                    <li key={i}>
                      <a href={res.url} target="_blank" rel="noopener noreferrer">
                        {res.title}
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'quiz' && (
          <div className="quiz-container">
            <div className="quiz-intro">
              <h3>Quiz Questions</h3>
              <div className="quiz-controls">
                <button 
                  className="show-answers-button"
                  onClick={() => setShowAnswers(!showAnswers)}
                >
                  {showAnswers ? 'Hide Answers' : 'Show Answers'}
                </button>
              </div>
            </div>
            <div className="quiz-content">
              {renderQuizQuestions()}
            </div>
          </div>
        )}


        {activeTab === 'assignments' && (
          <div className="assignments-container">
            <div className="assignments-intro">
              <h3>Assignments</h3>
              <p>Apply what you've learned with these hands-on assignments.</p>
            </div>
            <div className="assignments-content">
              {renderAssignments()}
            </div>
          </div>
        )}
      </div>

      <div className="module-navigation">
  {activeModuleIndex > 0 && (
    <button
      className="nav-button prev-button"
      onClick={() => {
        setActiveModuleIndex(activeModuleIndex - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
      Previous Module
    </button>
  )}

  {activeModuleIndex < currentCourse.modules.length - 1 && (
    <button
      className="nav-button next-button"
      onClick={() => {
        setActiveModuleIndex(activeModuleIndex + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
    >
      Next Module
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
      </svg>
    </button>
  )}
</div>
    </div>
  );
}

function YoutubeEmbed({ videoInfo }) {
  if (!videoInfo) return null;

  return (
    <div className="youtube-embed">
      <div className="video-container">
        <iframe
          src={videoInfo.embed_url}
          title={videoInfo.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      <div className="video-info">
        <h4>{videoInfo.title}</h4>
        <p className="channel-name">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
          </svg>
          {videoInfo.channel}
        </p>
        <div className="video-actions">
          <a href={videoInfo.watch_url} target="_blank" rel="noopener noreferrer" className="youtube-link">
            Watch on YouTube
          </a>
          <a href={`https://img.youtube.com/vi/${videoInfo.video_id}/maxresdefault.jpg`} target="_blank" rel="noopener noreferrer" className="thumbnail-link">
            View Thumbnail
          </a>
        </div>
      </div>
    </div>
  );
}

export default ModuleContent;
