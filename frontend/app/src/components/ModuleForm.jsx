import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createModule, updateModule } from '../features/course/moduleSlice';
import { uploadFile, deleteFile } from '../features/course/fileSlice';
import { useNavigate } from 'react-router-dom';
import styles from './styles/ModuleForm.module.css';

const ModuleForm = ({ module, courseId, existingFiles = [] }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: module?.title || '',
    description: module?.description || '',
  });

  const [files, setFiles] = useState([]);
  const [removedFileIds, setRemovedFileIds] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov', '.doc', '.docx', '.ppt', '.pptx'];

  useEffect(() => {
    const moduleFiles = existingFiles.filter(file => file.module === module?.id);
    setFiles(moduleFiles);
  }, [existingFiles, module?.id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(file =>
      validExtensions.includes(file.name.slice(file.name.lastIndexOf('.')).toLowerCase())
    );
    const invalidFiles = selectedFiles.filter(file =>
      !validExtensions.includes(file.name.slice(file.name.lastIndexOf('.')).toLowerCase())
    );

    if (invalidFiles.length > 0) {
      setErrors({ ...errors, files: `Invalid file type(s): ${invalidFiles.map(file => file.name).join(', ')}.` });
    } else {
      setErrors({ ...errors, files: null });
    }

    setFiles([...files, ...validFiles]);
  };

  const handleRemoveFile = (index) => {
    const fileToRemove = files[index];
    if (fileToRemove && !(fileToRemove instanceof File)) {
      setRemovedFileIds([...removedFileIds, fileToRemove.id]);
    }

    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
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
        let moduleResponse;
        
        // モジュールの新規作成または更新
        const moduleData = new FormData();
        moduleData.append('title', formData.title);
        moduleData.append('description', formData.description);
        moduleData.append('course', courseId);
  
        if (module) {
          // 既存モジュールの更新
          moduleResponse = await dispatch(updateModule({ id: module.id, moduleData })).unwrap();
          setSuccessMessage('Module updated successfully');
        } else {
          // 新規モジュールの作成
          moduleResponse = await dispatch(createModule(moduleData)).unwrap();
          setSuccessMessage('Module created successfully');
        }
  
        // ファイルをFileエンドポイントに送信
        for (let file of files) {
          if (file instanceof File) {
            const fileData = new FormData();
            fileData.append('file', file);
            fileData.append('title', file.name);
            fileData.append('module', moduleResponse.id);
  
            console.log("Uploading file:", file.name);
            await dispatch(uploadFile(fileData));
          }
        }
  
        // 削除するファイルの処理
        for (let fileId of removedFileIds) {
          console.log("Deleting file with ID:", fileId);
          await dispatch(deleteFile(fileId)); // 削除アクションを呼び出し
        }
  
        setErrors({});
        navigate(`/courses/${courseId}`);
      } catch (error) {
        console.log('Full error object:', error);
        setErrors({ form: 'Failed to save module or files. Please try again.' });
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
          <label>Add Files</label>
          <input
            id="file-input"
            type="file"
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            onClick={() => document.getElementById('file-input').click()}
            className={styles.chooseFileButton}
          >
            Choose Files
          </button>
          <div className={styles.fileList}>
            {files.map((file, index) => (
              <div key={index} className={styles.fileItem}>
                <span>{file.name || file.title}</span>
                <button type="button" onClick={() => handleRemoveFile(index)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
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
