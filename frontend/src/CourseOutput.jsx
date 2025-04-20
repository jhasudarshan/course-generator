import React from 'react';

function CourseOutput({ courseData }) {
  if (!courseData || !courseData.modules) {
    return <div>No course data available yet.</div>;
  }

  return (
    <div>
      <h2>{courseData.title}</h2>
      <p>{courseData.description}</p>
      {courseData.modules.map((module, index) => (
        <div key={index} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '15px' }}>
          <h3>Module {index + 1}: {module.module_title}</h3>
          <h4>Objectives:</h4>
          <ul>
            {module.objectives.map((objective, i) => (
              <li key={i}>{objective}</li>
            ))}
          </ul>
          <h4>Lesson Content:</h4>
          <p>{module.lesson_content}</p>
          {module.youtube_data && module.youtube_data.video_info && (
            <div>
              <h4>Recommended Video: {module.youtube_data.video_info.title}</h4>
              <iframe
                width="560"
                height="315"
                src={`https://www.youtube.com/embed/$${module.youtube_data.video_info.video_id}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          )}
          {module.quiz_questions && (
            <div>
              <h4>Quiz Questions:</h4>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{module.quiz_questions}</pre>
            </div>
          )}
          {module.assignments && (
            <div>
              <h4>Assignments:</h4>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{module.assignments}</pre>
            </div>
          )}
          <hr />
        </div>
      ))}
    </div>
  );
}

export default CourseOutput;