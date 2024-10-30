import React from 'react';
import CourseForm from './CourseForm';
import { useNavigate } from 'react-router-dom';

const CreateCoursePage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Create a New Course</h1>
      <CourseForm onClose={() => navigate('/courses')} />
    </div>
  );
};

export default CreateCoursePage;
