import React from 'react';
import CourseForm from './CourseForm';
import NavBar from './NavBar';
import { useNavigate } from 'react-router-dom';

const CreateCoursePage = () => {
  const navigate = useNavigate();

  return (
    <div>
    <div>
      <CourseForm onClose={() => navigate('/courses')} />
    </div>
    </div>
  );
};

export default CreateCoursePage;
