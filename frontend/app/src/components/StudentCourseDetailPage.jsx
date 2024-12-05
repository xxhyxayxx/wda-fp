import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchCourses } from '../features/course/courseSlice';
import { fetchModules } from '../features/course/moduleSlice';
import { fetchFiles } from '../features/course/fileSlice';
import { completeProgress, fetchCourseProgress } from '../features/course/moduleProgressSlice';
import NavBar from './NavBar';
import styles from './styles/StudentCourseDetailPage.module.css';

const StudentCourseDetailPage = () => {
    const { courseId } = useParams();
    const dispatch = useDispatch();
    const { courses } = useSelector((state) => state.course);
    const { modules } = useSelector((state) => state.module);
    const { files } = useSelector((state) => state.file);
    const { progress, courseProgress } = useSelector((state) => state.moduleProgress);
    const [course, setCourse] = useState(null);
    const [fileDrawerOpen, setFileDrawerOpen] = useState({});
    const [hasFetchedFiles, setHasFetchedFiles] = useState(false);

    useEffect(() => {
        async function loadCourseDetails() {
            if (courses.length === 0) {
                await dispatch(fetchCourses()).unwrap();
            }
            const selectedCourse = courses.find((c) => c.id === parseInt(courseId));
            if (selectedCourse) {
                setCourse(selectedCourse);
                await dispatch(fetchModules(selectedCourse.id)).unwrap();
                await dispatch(fetchCourseProgress(selectedCourse.id)).unwrap();
            }
        }
        loadCourseDetails();
    }, [dispatch, courseId, courses]);

    useEffect(() => {
        if (modules.length > 0 && !hasFetchedFiles) {
            const fetchAllFiles = async () => {
                const moduleIds = modules
                    .filter((module) => module.course === parseInt(courseId))
                    .map((module) => module.id);

                for (const moduleId of moduleIds) {
                    await dispatch(fetchFiles(moduleId)).unwrap();
                }
                setHasFetchedFiles(true);
            };
            fetchAllFiles();
        }
    }, [modules, hasFetchedFiles, dispatch, courseId]);

    useEffect(() => {
        // モジュール完了の進捗をリロードする
        if (progress && Object.keys(progress).length > 0) {
            console.log('Progress updated:', progress); // デバッグ用
        }
    }, [progress]);

    const toggleFileDrawer = (moduleId) => {
        setFileDrawerOpen((prevState) => ({
            ...prevState,
            [moduleId]: !prevState[moduleId],
        }));
    };

    const handleCompleteModule = async (moduleId) => {
        try {
            await dispatch(completeProgress(moduleId)).unwrap();
            await dispatch(fetchCourseProgress(courseId)).unwrap();
        } catch (error) {
            console.error('Failed to complete module:', error);
        }
    };

    const filteredModules = modules.filter((module) => module.course === parseInt(courseId));
    const courseProgressData = courseProgress[courseId] || {};
    const courseProgressPercentage = courseProgressData.course_progress || 0;

    return (
        <div>
            <NavBar />
            <div className={styles.courseDetailContainer}>
                {course ? (
                    <>
                        <div className={styles.header}>
                            <h2>{course.title}</h2>
                            <p className={styles.category}>{course.category}</p>
                            <p className={styles.progress}>Progress: {courseProgressPercentage}%</p>
                        </div>
                        <p className={styles.description}>{course.description}</p>
                        <div className={styles.modulesSection}>
                            {filteredModules.length > 0 ? (
                                filteredModules.map((module) => {
                                    const moduleFiles = files[module.id] || [];
                                    const isDrawerOpen = fileDrawerOpen[module.id];
                                    const isModuleCompleted = progress[module.id]?.is_completed || false;

                                    return (
                                        <div key={module.id} className={styles.moduleCard}>
                                            <div className={styles.moduleHeader}>
                                                <h4>{module.title}</h4>
                                                <span
                                                    className={`${styles.moduleStatus} ${
                                                        isModuleCompleted
                                                            ? styles.completedLabel
                                                            : styles.incompleteLabel
                                                    }`}
                                                >
                                                    {isModuleCompleted ? 'Completed' : 'Incomplete'}
                                                </span>
                                                <i
                                                    className={`fa-solid ${
                                                        isDrawerOpen ? 'fa-chevron-up' : 'fa-chevron-down'
                                                    }`}
                                                    onClick={() => toggleFileDrawer(module.id)}
                                                    style={{ cursor: 'pointer' }}
                                                ></i>
                                            </div>
                                            {isDrawerOpen && (
                                                <div className={styles.fileDrawer}>
                                                    <p className={styles.moduleDescription}>{module.description}</p>
                                                    {moduleFiles.length > 0 ? (
                                                        moduleFiles.map((file) => (
                                                            <div key={file.id} className={styles.fileItem}>
                                                                <a
                                                                    className={styles.fileLinkText}
                                                                    href={file.file}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    {file.file.split('/').pop()}
                                                                </a>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p>No files available.</p>
                                                    )}
                                                    <button
                                                        className={`${styles.completeButton} ${
                                                            isModuleCompleted ? styles.completed : ''
                                                        }`}
                                                        onClick={() => handleCompleteModule(module.id)}
                                                        disabled={isModuleCompleted}
                                                    >
                                                        {isModuleCompleted ? 'Completed' : 'Mark as Completed'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <p>No modules available.</p>
                            )}
                        </div>
                    </>
                ) : (
                    <p>Loading course details...</p>
                )}
            </div>
        </div>
    );
};

export default StudentCourseDetailPage;
