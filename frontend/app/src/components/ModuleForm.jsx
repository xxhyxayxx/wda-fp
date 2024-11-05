import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createModule, updateModule } from '../features/course/moduleSlice';
import { uploadFile } from '../features/course/fileSlice';
import { useNavigate } from 'react-router-dom'; // 追加
import styles from './styles/ModuleForm.module.css';

const ModuleForm = ({ module, courseId }) => {  // onClose を削除
  const dispatch = useDispatch();
  const navigate = useNavigate(); // navigateを追加
  const [formData, setFormData] = useState({
    title: module?.title || '',
    description: module?.description || '',
  });
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov', '.doc', '.docx', '.ppt', '.pptx'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const invalidFiles = selectedFiles.filter(file => !validExtensions.includes(file.name.slice(file.name.lastIndexOf('.')).toLowerCase()));

    if (invalidFiles.length > 0) {
      setErrors({ ...errors, files: `Invalid file type(s): ${invalidFiles.map(file => file.name).join(', ')}. Allowed extensions are: ${validExtensions.join(', ')}` });
      setFiles([]);
    } else {
      setErrors({ ...errors, files: null });
      setFiles(selectedFiles);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
  
    if (!formData.title) {
      newErrors.title = 'Title is required';
    }
  
    setErrors(newErrors);
  
    if (Object.keys(newErrors).length === 0 && !errors.files) {
      try {
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('course', courseId); // courseIdを追加
  
        // ファイルをFormDataに追加
        files.forEach((file) => {
          formDataToSend.append('file', file);
        });
  
        let moduleResponse;
        if (module) {
          moduleResponse = await dispatch(updateModule({ id: module.id, moduleData: formDataToSend })).unwrap();
          setSuccessMessage('Module updated successfully');
        } else {
          moduleResponse = await dispatch(createModule(formDataToSend)).unwrap();
          setSuccessMessage('Module created successfully');
        }
  
        setErrors({});
        navigate(`/courses/${courseId}`); // 送信後にCourseDetailPageにリダイレクト
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
        <div className={styles.formBlock}>
          <label htmlFor="files">Add Files</label>
          <input
            id="files"
            name="files"
            type="file"
            multiple
            onChange={handleFileChange}
          />
          {errors.files && <span className={styles.errorMessage}>{errors.files}</span>}
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
