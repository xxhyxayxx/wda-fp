import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import CourseForm from './CourseForm';

const EditCoursePage = () => {
  const { courseId } = useParams(); // URLからコースIDを取得
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [course, setCourse] = useState(null);
  const { courses } = useSelector((state) => state.course);

  useEffect(() => {
    // 既存のコースを検索してセットする
    const existingCourse = courses.find((c) => c.id === parseInt(courseId));
    if (existingCourse) {
      setCourse(existingCourse);
    } else {
      // 存在しない場合はコース一覧にリダイレクト
      navigate('/courses');
    }
  }, [courseId, courses, navigate]);

  return (
    <div>
      <h1>Edit Course</h1>
      {course ? (
        <CourseForm course={course} onClose={() => navigate('/courses')} />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default EditCoursePage;
