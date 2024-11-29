import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCourses, deleteCourse } from '../features/course/courseSlice';
import { fetchModules, deleteModule } from '../features/course/moduleSlice';
import { fetchFiles } from '../features/course/fileSlice';
import NavBar from './NavBar';
import styles from './styles/CourseDetailPage.module.css';

const CourseDetailPage = () => {
    const { courseId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { courses } = useSelector((state) => state.course);
    const { modules } = useSelector((state) => state.module);
    const { files } = useSelector((state) => state.file);
    const [course, setCourse] = useState(null);
    const [menuOpen, setMenuOpen] = useState(null);
    const [courseMenuOpen, setCourseMenuOpen] = useState(false);
    const [fileDrawerOpen, setFileDrawerOpen] = useState({}); // モジュールごとのドロワー開閉状態を追跡

    // ファイルフェッチ済みフラグ
    const [hasFetchedFiles, setHasFetchedFiles] = useState(false);

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

    // modules が初期ロードされたら、一度だけファイルをフェッチする
    useEffect(() => {
        if (modules.length > 0 && !hasFetchedFiles) {
            const fetchAllFiles = async () => {
                const filteredModuleIds = modules
                    .filter(module => module.course === parseInt(courseId))
                    .map(module => module.id);
    
                try {
                    for (const moduleId of filteredModuleIds) {
                        await dispatch(fetchFiles(moduleId)).unwrap();
                    }
    
                    // Redux の `files` ステートを確認
                    console.log("Redux state - files after fetching:", files);
    
                    setHasFetchedFiles(true);
                } catch (error) {
                    console.error("Error fetching files:", error);
                }
            };
    
            fetchAllFiles();
        }
    }, [modules, hasFetchedFiles, dispatch, courseId]);

    useEffect(() => {
        console.log("Files state:", files);
    }, [files]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            // ドロップダウンメニューまたはトリガー以外をクリックした場合、メニューを閉じる
            if (!event.target.closest(`.${styles.dropdownMenu}`) && !event.target.closest('.fa-ellipsis')) {
                setMenuOpen(null);
                setCourseMenuOpen(false);
            }
        };

        // mousedown イベントリスナーを追加
        document.addEventListener('mousedown', handleClickOutside);

        // クリーンアップ
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleCourseMenu = () => {
        setCourseMenuOpen(!courseMenuOpen);
    };

    const toggleModuleMenu = (moduleId) => {
        setMenuOpen(menuOpen === moduleId ? null : moduleId);
    };

    const toggleFileDrawer = (moduleId) => {
        setFileDrawerOpen(prevState => ({
            ...prevState,
            [moduleId]: !prevState[moduleId] // モジュールごとの開閉状態をトグル
        }));
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
        const moduleFiles = files[moduleId] || []; // モジュールに関連するファイルのみ
        navigate(`/edit-module/${moduleId}`, { state: { moduleFiles } }); // ファイルをstateで渡す
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
                        <p className={styles.description}>{course.description}</p>
                        <p className={styles.category}>{course.category}</p>
                        <div className={styles.modulesSection}>
                        {filteredModules.length > 0 ? (
                                filteredModules.map((module) => {
                                    const moduleFiles = files[module.id] || [];
                                    console.log(`Module ID: ${module.id}, Files:`, moduleFiles); // ここで挿入
                                    const isDrawerOpen = fileDrawerOpen[module.id];
                                    return (
                                        <div key={module.id} className={styles.moduleCard}>
                                            <div className={styles.moduleHeader}>
                                                <h4>{module.title}</h4>
                                                <ul className={styles.moduleMenuIcon}>
                                                    <li>
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
                                                    </li>
                                                    <li>
                                                        <i
                                                            className={`fa-solid ${isDrawerOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}
                                                            onClick={() => toggleFileDrawer(module.id)}
                                                            style={{ cursor: 'pointer', marginLeft: '10px' }}
                                                        ></i>
                                                    </li>
                                                </ul>
                                            </div>

                                            {isDrawerOpen && (
                                                <div className={styles.fileDrawer}>
                                                    <p className={styles.moduleDescription}>{module.description}</p>
                                                    {moduleFiles.length > 0 && (
                                                        moduleFiles.map(file => (
                                                            <div key={file.id} className={styles.fileItem}>
                                                                <a className={styles.fileLinkText} href={file.file} target="_blank" rel="noopener noreferrer">
                                                                    {file.file.split('/').pop()}
                                                                </a>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <p>No modules available.</p>
                            )}




                            <button onClick={handleAddModule} className={styles.addModuleButton}>
                                <i className="fa-solid fa-plus" style={{ marginRight: '5px' }}></i>Add Module
                            </button>
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
