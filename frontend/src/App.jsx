import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CourseGrid from './components/components/CourseGrid';
import CourseDetail from './components/components/CourseDetail';
import CourseCreationPage from './components/components/CourseCreationPage';

import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
  <img src="./logo2.png" alt="Logo" className="logo" height={42} width={42} />
  <h1 style={{ paddingLeft: '10px', margin: 0 }}>CourseGen</h1>
</div>
          
        </header>
        <main>
          <Routes>
            <Route path="/courses" element={<CourseGrid />} />
            <Route path="/course/:courseId" element={<CourseDetail />} />
            <Route path="/create-course" element={<CourseCreationPage />} />
          </Routes>
        </main>
        <footer className="app-footer">
          <p>© 2025 Learning Platform</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;














// import React, { useState } from 'react';
// import CourseInput from './CourseInput';
// import CourseOutput from './CourseOutput';

// function App() {
//   const [courseData, setCourseData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const handleGenerate = async (userInput) => {
//     setLoading(true);
//     setError(null);
//     try {
//       // Make sure userInput has all required fields
//       const formattedInput = {
//         topic: userInput.topic || "",
//         audience: userInput.audience || "",
//         difficulty: userInput.difficulty || "",
//         language: userInput.language || "",
//         outcome: userInput.outcome || "", // This must be "description", not "outcome"
//         duration: userInput.duration || "",
//         tone: userInput.tone || ""
//       };

//       const response = await fetch('/api/generate-course', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(formattedInput),
//       });
//       console.log("Response:", response);
//       if (!response.ok) {
//         const message = `An error has occurred: ${response.status}`;
//         throw new Error(message);
//       }
//       const data = await response.json();
//       setCourseData(data.generated_data);
//     } catch (error) {
//       setError(error.message);
//       console.error("Error fetching course data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
//       <h1>AI Course Creator</h1>
//       <CourseInput onGenerate={handleGenerate} />
//       {loading && <div>Generating course outline...</div>}
//       {error && <div style={{ color: 'red' }}>Error: {error}</div>}
//       {courseData && <CourseOutput courseData={courseData} />}
//     </div>
//   );
// }

// export default App;