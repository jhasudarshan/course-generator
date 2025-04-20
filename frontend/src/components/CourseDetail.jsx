import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ModuleSidebar from './ModuleSidebar';
import ModuleContent from './ModuleContent';
import './CourseDetail.css';

function CourseDetail() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch course details');
        }
        const data = await response.json();
        setCourse(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [courseId]);

  if (loading) return <div className="loading">Loading course content...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!course) return <div className="error">Course not found</div>;

  return (
    <div className="course-detail">
      <div className="course-header">
        <h2>{course.title}</h2>
        <p className="course-description">{course.description}</p>
        <div className="course-meta-details">
          {course.difficulty && <span className="meta-item">Level: {course.difficulty}</span>}
          {course.audience && <span className="meta-item">Audience: {course.audience}</span>}
          {course.topic && <span className="meta-item">Topic: {course.topic}</span>}
          {course.language && <span className="meta-item">Language: {course.language}</span>}
          {course.created_by && <span className="meta-item">Created by: {course.created_by}</span>}
        </div>
      </div>
      
      <div className="course-content">
        <ModuleSidebar 
          modules={course.modules} 
          activeModuleIndex={activeModuleIndex} 
          setActiveModuleIndex={setActiveModuleIndex} 
        />
        <ModuleContent module={course.modules[activeModuleIndex]} />
      </div>
    </div>
  );
}

export default CourseDetail;