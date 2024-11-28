import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createModule, updateModule } from '../features/course/moduleSlice';
import { batchUpdateFiles } from '../features/course/fileSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './styles/ModuleForm.module.css';

const ModuleForm = ({ module, courseId }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { moduleFiles } = location.state || {};
    const [formData, setFormData] = useState({
        title: module?.title || '',
        description: module?.description || '',
    });
    const [selectedFiles, setSelectedFiles] = useState(moduleFiles || []);
    const [filesToDelete, setFilesToDelete] = useState([]);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [fileName, setFileName] = useState('');

    useEffect(() => {
        if (module && moduleFiles) {
            setSelectedFiles(moduleFiles);
        }
    }, [module, moduleFiles]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
        if (files.length > 0) {
            const truncatedName = files[0].name.length > 20 ? `${files[0].name.slice(0, 17)}...` : files[0].name;
            setFileName(truncatedName);
        }
    };

    const handleRemoveFile = (file) => {
        if (file.id) {
            setFilesToDelete((prev) => [...prev, file.id]);
        }
        setSelectedFiles((prevFiles) => prevFiles.filter((f) => f !== file));
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

                const filesData = {
                    moduleId,
                    filesToCreate: selectedFiles.filter((f) => !f.id),
                    filesToUpdate: selectedFiles.filter((f) => f.id && !filesToDelete.includes(f.id)),
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
                    <input id="title" name="title" type="text" value={formData.title} onChange={handleInputChange} />
                    {errors.title && <span className={styles.errorMessage}>{errors.title}</span>}
                </div>
                <div className={styles.formBlock}>
                    <label htmlFor="description">Description</label>
                    <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} className={styles.moduleTextarea} />
                    {errors.description && <span className={styles.errorMessage}>{errors.description}</span>}
                </div>
                <div className={styles.formBlock}>
                    <label htmlFor="file" className={styles.customFileUpload}>Add Files</label>
                    <input
                        id="file"
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className={styles.hiddenFileInput}  // デフォルトのファイル入力を非表示
                    />
                    <ul className={styles.fileList}>
                        {selectedFiles.map((file, index) => {
                            const filePath = file.file || (file.name && URL.createObjectURL(file)) || '';
                            const fileName = filePath.split('/').pop() || 'Unnamed File';

                            if (file.name) {
                                URL.revokeObjectURL(filePath);  // メモリリーク防止
                            }

                            return (
                                <li key={file.id || index} className={styles.fileItem}>
                                    <span className={styles.fileName}>{fileName}</span>
                                    <i
                                        className="fa-solid fa-circle-xmark"
                                        onClick={() => handleRemoveFile(file)}
                                        style={{ cursor: 'pointer', color: 'red', margin: '5px', fontSize: '22px' }}
                                    ></i>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                {errors.form && <div role="alert" className={styles.errorMessage}>{errors.form}</div>}
                {successMessage && <div role="alert" className={styles.successMessage}>{successMessage}</div>}
                <button type="submit" className={styles.submitBtn}>{module ? 'Update Module' : 'Create Module'}</button>
            </form>
        </div>
    );
};

export default ModuleForm;
