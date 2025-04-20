import { create } from "zustand";

const useCourseStore = create((set) => ({
  // Courses list state
  courses: [],
  coursesLoading: false,
  coursesError: null,

  // Current course state
  currentCourse: null,
  activeModuleIndex: 0,

  // Course generation state
  generationLoading: false,
  generationError: null,
  generationJobId: null,
  generationSuccessRedirect: null,

  // Actions
  fetchCourses: async () => {
    set({ coursesLoading: true, coursesError: null });
    try {
      const response = await fetch("/api/courses");
      if (!response.ok) throw new Error("Failed to fetch courses");
      const data = await response.json();
      set({ courses: data, coursesLoading: false });
    } catch (error) {
      set({ coursesError: error.message, coursesLoading: false });
    }
  },

  fetchCourseDetails: async (courseId) => {
    set({ coursesLoading: true, coursesError: null });
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      if (!response.ok) throw new Error("Failed to fetch course details");
      const data = await response.json();
      set({ currentCourse: data, coursesLoading: false, activeModuleIndex: 0 });
    } catch (error) {
      set({ coursesError: error.message, coursesLoading: false });
    }
  },

  setActiveModuleIndex: (index) => set({ activeModuleIndex: index }),

  clearCurrentCourse: () => set({ currentCourse: null, activeModuleIndex: 0 }),

  generateCourse: async (courseData) => {
    set({
      generationLoading: true,
      generationError: null,
      generationJobId: null,
      generationSuccessRedirect: null,
    });
    try {
      const response = await fetch("/api/generate-course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to generate course: ${response.statusText} - ${
            errorData?.message || "No details"
          }`
        );
      }

      const data = await response.json();
      set({
        generationJobId: data.job_id,
        generationLoading: false,
        generationSuccessRedirect: "/courses", // Set the redirect URL on success
      });
    } catch (error) {
      console.error("Error generating course:", error);
      set({ generationError: error.message, generationLoading: false });
    }
  },

  clearGenerationState: () =>
    set({
      generationLoading: false,
      generationError: null,
      generationJobId: null,
      generationSuccessRedirect: null,
    }),
}));

export default useCourseStore;
