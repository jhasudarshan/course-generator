import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useCourseStore from '../../store/CourseStore';
import './CourseGrid.css';
import { PlusCircle } from 'lucide-react'; // Import the plus icon

function CourseGrid() {
  const { courses, coursesLoading, coursesError, fetchCourses, clearCurrentCourse } = useCourseStore();
  const navigate = useNavigate();

  useEffect(() => {
    clearCurrentCourse();

    // Only fetch courses if we don't already have them
    if (courses.length === 0) {
      fetchCourses();
    }
  }, [clearCurrentCourse, fetchCourses, courses.length]);

  if (coursesLoading) return <div className="loading">Loading courses...</div>;
  if (coursesError) return <div className="error">Error: {coursesError}</div>;

  const handleCreateNewCourse = () => {
    navigate('/create-course');
  };

  return (
    <div className="course-grid-container">
      <div className="course-grid-header">
        <h2>Available Courses</h2>
        <button onClick={handleCreateNewCourse} className="create-course-button">
          <PlusCircle className="create-course-icon" /> Create New Course
        </button>
      </div>
      <div className="course-grid">
        {courses.map(course => (
          <Link to={`/course/${course._id}`} key={course._id} className="course-card">
            <div className="course-card-content">
              <h3>{course.title}</h3>
              <div className="course-meta">
                {course.topic && <span className="course-topic">Topic: {course.topic}</span>}
                {course.difficulty && <span className="course-difficulty">Level: {course.difficulty}</span>}
                {course.audience && <span className="course-audience">For: {course.audience}</span>}
              </div>
              <div className="course-date">Added: {new Date(course.created_at).toLocaleDateString()}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default CourseGrid;