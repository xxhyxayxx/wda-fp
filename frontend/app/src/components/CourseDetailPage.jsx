import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCourses, deleteCourse } from '../features/course/courseSlice';
import { fetchModules } from '../features/course/moduleSlice';
import NavBar from './NavBar';
import styles from './styles/CourseDetailPage.module.css';

const CourseDetailPage = () => {
    const { courseId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { courses } = useSelector((state) => state.course);
    const { modules = [] } = useSelector((state) => state.module || {});
    const [course, setCourse] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        async function loadCourseDetails() {
            try {
                if (courses.length === 0) {
                    await dispatch(fetchCourses()).unwrap();
                }
                const selectedCourse = courses.find((c) => c.id === parseInt(courseId));
                if (selectedCourse) {
                    setCourse(selectedCourse);
                    dispatch(fetchModules(selectedCourse.id));
                }
            } catch (error) {
                console.error('Error loading course details:', error);
            }
        }
        loadCourseDetails();
    }, [dispatch, courseId, courses]);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleEditCourse = () => {
        navigate(`/edit-course/${courseId}`);
        setMenuOpen(false);
    };

    const handleDeleteCourse = async () => {
        if (window.confirm('Are you sure you want to delete this course? This will also delete all associated modules and files.')) {
            try {
                await dispatch(deleteCourse(courseId)).unwrap();
                navigate('/courses');  // コース一覧ページに戻る
            } catch (error) {
                console.error('Failed to delete course:', error);
            }
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(`.${styles.dropdownMenu}`) && !event.target.closest('.fa-ellipsis')) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
                                onClick={toggleMenu}
                                style={{ cursor: 'pointer' }}
                            ></i>
                            {menuOpen && (
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
                            {modules.length > 0 ? (
                                modules.map((module) => (
                                    <div key={module.id} className={styles.moduleCard} onClick={() => navigate(`/courses/modules/${module.id}`)}>
                                        <h4>{module.title}</h4>
                                        <p>{module.description}</p>
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
