import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createCourse, updateCourse } from '../features/course/courseSlice';
import styles from './styles/CourseForm.module.css';

const CourseForm = ({ course, onClose }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    title: course?.title || '',
    description: course?.description || '',
    category: course?.category || '',
    is_published: course?.is_published || false,
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // フォームバリデーション
    if (!formData.title) {
      newErrors.title = 'Title is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        if (course) {
          await dispatch(updateCourse({ id: course.id, courseData: formData })).unwrap();
          setSuccessMessage('Course updated successfully');
        } else {
          await dispatch(createCourse(formData)).unwrap();
          setSuccessMessage('Course created successfully');
        }
        setErrors({});
        onClose();
      } catch (error) {
        console.log('Full error object:', error);
        try {
          const errorData = JSON.parse(error);
          if (typeof errorData === 'object') {
            const dynamicErrors = {};
            Object.entries(errorData).forEach(([key, value]) => {
              dynamicErrors[key] = Array.isArray(value) ? value.join(', ') : value;
            });
            setErrors(dynamicErrors);
          } else {
            setErrors({ form: errorData });
          }
        } catch (e) {
          console.error('Failed to parse error message:', e);
          setErrors({ form: 'Failed to save course. Please try again.' });
        }
      }
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.courseFormTitle}>{course ? 'Edit Course' : 'Create Course'}</h2>
      <form onSubmit={handleSubmit} className={styles.formBox}>
        <div className={styles.formBlock}>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleInputChange}
          />
          {errors.title && <span className={styles.errorMessage}>{errors.title}</span>}
        </div>
        <div className={styles.formBlock}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
          />
          {errors.description && <span className={styles.errorMessage}>{errors.description}</span>}
        </div>
        <div className={styles.formBlock}>
          <label htmlFor="category">Category</label>
          <input
            id="category"
            name="category"
            type="text"
            value={formData.category}
            onChange={handleInputChange}
          />
          {errors.category && <span className={styles.errorMessage}>{errors.category}</span>}
        </div>
        <div className={styles.formBlockCheck}>
          <label htmlFor="is_published">Publish</label>
          <input
            id="is_published"
            name="is_published"
            type="checkbox"
            checked={formData.is_published}
            onChange={handleInputChange}
          />
        </div>
        {errors.form && <div role="alert" className={styles.errorMessage}>{errors.form}</div>}
        {successMessage && <div role="alert" className={styles.successMessage}>{successMessage}</div>}
        <button type="submit" className={styles.submitBtn}>
          {course ? 'Update Course' : 'Create Course'}
        </button>
      </form>
    </div>
  );
};

export default CourseForm;