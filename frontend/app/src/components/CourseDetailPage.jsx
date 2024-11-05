import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCourses, deleteCourse } from '../features/course/courseSlice';
import { fetchModules, deleteModule } from '../features/course/moduleSlice';
import { fetchFiles } from '../features/course/fileSlice'; // ファイルフェッチ用のアクションをインポート
import NavBar from './NavBar';
import styles from './styles/CourseDetailPage.module.css';

const CourseDetailPage = () => {
    const { courseId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { courses } = useSelector((state) => state.course);
    const { modules } = useSelector((state) => state.module);
    const { files } = useSelector((state) => state.file); // ファイル情報を取得
    const [course, setCourse] = useState(null);
    const [menuOpen, setMenuOpen] = useState(null); // モジュールのメニュー管理用
    const [courseMenuOpen, setCourseMenuOpen] = useState(false); // コースのメニュー管理用

    useEffect(() => {
        async function loadCourseDetails() {
            try {
                if (courses.length === 0) {
                    await dispatch(fetchCourses()).unwrap();
                }
                const selectedCourse = courses.find((c) => c.id === parseInt(courseId));
                if (selectedCourse) {
                    setCourse(selectedCourse);
                    await dispatch(fetchModules(selectedCourse.id)).unwrap();
                }
            } catch (error) {
                console.error('Error loading course details:', error);
            }
        }
        loadCourseDetails();
    }, [dispatch, courseId, courses]);

    // modules のロードが完了した後にファイルをフェッチする
    useEffect(() => {
        if (modules.length > 0) {
            const moduleIds = modules.map(module => module.id);
            moduleIds.forEach(moduleId => {
                dispatch(fetchFiles(moduleId));
            });
        }
    }, [modules, dispatch]);

    // ファイル情報をコンソールで確認
    useEffect(() => {
        console.log("Fetched files:", files);
    }, [files]);

    const toggleCourseMenu = () => {
        setCourseMenuOpen(!courseMenuOpen);
    };

    const toggleModuleMenu = (moduleId) => {
        setMenuOpen(menuOpen === moduleId ? null : moduleId);
    };

    const handleEditCourse = () => {
        navigate(`/edit-course/${courseId}`);
        setCourseMenuOpen(false);
    };

    const handleDeleteCourse = async () => {
        if (window.confirm('Are you sure you want to delete this course? This will also delete all associated modules and files.')) {
            try {
                await dispatch(deleteCourse(courseId)).unwrap();
                navigate('/courses');
            } catch (error) {
                console.error('Failed to delete course:', error);
            }
        }
    };

    const handleAddModule = () => {
        navigate(`/create-module?courseId=${courseId}`);
    };

    const handleEditModule = (moduleId) => {
        navigate(`/edit-module/${moduleId}`);
        setMenuOpen(null);
    };

    const handleDeleteModule = async (moduleId) => {
        if (window.confirm('Are you sure you want to delete this module?')) {
            try {
                await dispatch(deleteModule(moduleId)).unwrap();
                setMenuOpen(null);
            } catch (error) {
                console.error('Failed to delete module:', error);
            }
        }
    };

    const filteredModules = modules.filter(module => module.course === parseInt(courseId));

    return (
        <div>
            <NavBar />
            <div className={styles.courseDetailContainer}>
                {course ? (
                    <>
                        <div className={styles.header}>
                            <h2>{course.title}</h2>
                            <i
                                className="fa-solid fa-ellipsis"
                                onClick={toggleCourseMenu}
                                style={{ cursor: 'pointer' }}
                            ></i>
                            {courseMenuOpen && (
                                <div className={styles.dropdownMenu}>
                                    <button onClick={handleEditCourse} className={styles.editButton}>
                                        <i className="fa-solid fa-pen-to-square" style={{ marginRight: '5px' }}></i>Edit
                                    </button>
                                    <button onClick={handleDeleteCourse} className={styles.deleteButton}>
                                        <i className="fa-solid fa-trash" style={{ marginRight: '5px' }}></i>Delete
                                    </button>
                                </div>
                            )}
                        </div>
                        <p>{course.description}</p>
                        <p><strong>Category:</strong> {course.category}</p>
                        <p><strong>Published:</strong> {course.is_published ? 'Yes' : 'No'}</p>

                        <div className={styles.modulesSection}>
                            <h3>Modules</h3>
                            <button onClick={handleAddModule} className={styles.addModuleButton}>
                                <i className="fa-solid fa-plus" style={{ marginRight: '5px' }}></i>Add Module
                            </button>
                            {filteredModules.length > 0 ? (
                                filteredModules.map((module) => (
                                    <div key={module.id} className={styles.moduleCard}>
                                        <div onClick={() => navigate(`/courses/modules/${module.id}`)}>
                                            <h4>{module.title}</h4>
                                            <p>{module.description}</p>
                                            {/* ファイル一覧の表示 */}
                                            {files
                                                .filter(file => file.module === module.id)
                                                .map(file => (
                                                    <div key={file.id} className={styles.fileItem}>
                                                        <span>{file.title}</span>
                                                    </div>
                                            ))}
                                        </div>
                                        <i
                                            className="fa-solid fa-ellipsis"
                                            onClick={() => toggleModuleMenu(module.id)}
                                            style={{ cursor: 'pointer' }}
                                        ></i>
                                        {menuOpen === module.id && (
                                            <div className={styles.dropdownMenu}>
                                                <button onClick={() => handleEditModule(module.id)} className={styles.editButton}>
                                                    <i className="fa-solid fa-pen-to-square" style={{ marginRight: '5px' }}></i>Edit
                                                </button>
                                                <button onClick={() => handleDeleteModule(module.id)} className={styles.deleteButton}>
                                                    <i className="fa-solid fa-trash" style={{ marginRight: '5px' }}></i>Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
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

export default CourseDetailPage;
