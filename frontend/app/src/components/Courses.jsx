import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCourses } from '../features/course/courseSlice';
import styles from './styles/Courses.module.css';

const Courses = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courses, loading, error } = useSelector((state) => state.course);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const handleCreateCourse = () => {
    navigate('/create-course');
  };

  return (
    <div className={styles.coursesContainer}>
      <h1 className={styles.title}>Courses</h1>
      {loading ? (
        <p>Loading courses...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <>
          <button onClick={handleCreateCourse} className={styles.createButton}>
            Create Course
          </button>
          <ul className={styles.courseList}>
            {courses.map((course) => (
              <li key={course.id} className={styles.courseItem}>
                {course.name}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Courses;
