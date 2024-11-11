import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createModule, updateModule } from '../features/course/moduleSlice';
import { batchUpdateFiles } from '../features/course/fileSlice';
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
  const [selectedFiles, setSelectedFiles] = useState([]);  // 新規ファイルの管理
  const [filesToDelete, setFilesToDelete] = useState([]);  // 削除予定ファイルID

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
  };

  const handleRemoveFile = (file) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((f) => f !== file));
  };

  const handleDeleteExistingFile = (fileId) => {
    setFilesToDelete((prev) => [...prev, fileId]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.description) newErrors.description = 'Description is required';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const moduleData = new FormData();
        moduleData.append('title', formData.title);
        moduleData.append('description', formData.description);
        moduleData.append('course', courseId);

        let moduleId;
        if (module) {
          const updatedModule = await dispatch(updateModule({ id: module.id, moduleData })).unwrap();
          setSuccessMessage('Module updated successfully');
          moduleId = updatedModule.id;
        } else {
          const createdModule = await dispatch(createModule(moduleData)).unwrap();
          setSuccessMessage('Module created successfully');
          moduleId = createdModule.id;
        }

        // ファイルバッチ更新
        const filesData = {
          moduleId,
          filesToCreate: [],
          filesToUpdate: selectedFiles,  // 既存ファイル更新がある場合
          filesToDelete,
        };
        await dispatch(batchUpdateFiles(filesData)).unwrap();

        setErrors({});
        navigate(`/courses/${courseId}`);
      } catch (error) {
        console.error('Error during module save:', error);
        setErrors({ form: 'Failed to save module. Please try again.' });
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
          <label htmlFor="file">Add Files</label>
          <input
            id="file"
            type="file"
            multiple
            onChange={handleFileChange}
          />
          <ul className={styles.fileList}>
            {selectedFiles.map((file, index) => (
              <li key={index} className={styles.fileItem}>
                {file.name}
                <button type="button" onClick={() => handleRemoveFile(file)}>Remove</button>
              </li>
            ))}
          </ul>
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
