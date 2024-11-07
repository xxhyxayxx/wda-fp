import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createModule, updateModule } from '../features/course/moduleSlice';
import { useNavigate } from 'react-router-dom';
import styles from './styles/ModuleForm.module.css';

const ModuleForm = ({ module, courseId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: module?.title || '',
    description: module?.description || '',
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
  
    if (!formData.title) {
      newErrors.title = 'Title is required';
    }
  
    if (!formData.description) {
      newErrors.description = 'Description is required';
    }
  
    setErrors(newErrors);
  
    if (Object.keys(newErrors).length === 0) {
      try {
        const moduleData = new FormData();
        moduleData.append('title', formData.title);
        moduleData.append('description', formData.description);
        moduleData.append('course', courseId);
  
        if (module) {
          await dispatch(updateModule({ id: module.id, moduleData })).unwrap();
          setSuccessMessage('Module updated successfully');
        } else {
          await dispatch(createModule(moduleData)).unwrap();
          setSuccessMessage('Module created successfully');
        }
  
        setErrors({});
        navigate(`/courses/${courseId}`);
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
          setErrors({ form: 'Failed to save module. Please try again.' });
        }
      }
    }
  };  

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.moduleFormTitle}>{module ? 'Edit Module' : 'Create Module'}</h2>
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

        {errors.form && <div role="alert" className={styles.errorMessage}>{errors.form}</div>}
        {successMessage && <div role="alert" className={styles.successMessage}>{successMessage}</div>}
        <button type="submit" className={styles.submitBtn}>
          {module ? 'Update Module' : 'Create Module'}
        </button>
      </form>
    </div>
  );
};

export default ModuleForm;
