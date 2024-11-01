import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCourses, deleteCourse } from '../features/course/courseSlice';
import styles from './styles/Courses.module.css';
import NavBar from './NavBar';

const Courses = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { courses, loading, error } = useSelector((state) => state.course);
    const [menuOpen, setMenuOpen] = useState(null);

    useEffect(() => {
        async function loadCourses() {
            try {
                const result = await dispatch(fetchCourses()).unwrap();
                console.log('Fetched courses:', result);
            } catch (e) {
                console.error('Failed to fetch courses:', e);
            }
        }
        loadCourses();
    }, [dispatch]);

    const toggleMenu = (courseId) => {
        setMenuOpen(menuOpen === courseId ? null : courseId);
    };

    const handleEditCourse = (courseId) => {
        navigate(`/edit-course/${courseId}`);
        setMenuOpen(null); // メニューを閉じる
    };

    const handleDeleteCourse = async (courseId) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                await dispatch(deleteCourse(courseId)).unwrap();
                setMenuOpen(null); // メニューを閉じる
                console.log('Course deleted:', courseId);
            } catch (e) {
                console.error('Failed to delete course:', e);
            }
        }
    };

    const handleCreateCourse = () => {
        navigate('/create-course');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            // メニュー外をクリックした場合にメニューを閉じる
            if (!event.target.closest(`.${styles.dropdownMenu}`) && !event.target.closest('.fa-ellipsis')) {
                setMenuOpen(null);
            }
        };

        // イベントリスナーを追加
        document.addEventListener('mousedown', handleClickOutside);

        // クリーンアップ
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div>
            <NavBar />
            <div className={styles.coursesContainer}>
                {loading ? (
                    <p>Loading courses...</p>
                ) : error ? (
                    <p>Error: {error}</p>
                ) : courses.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p className={styles.emptyText}>No courses available</p>
                        <button onClick={handleCreateCourse} className={styles.createButton}>
                        Create Course
                        </button>
                    </div>
                ) : (
                    <div className={styles.mainBlock}>
                        <button onClick={handleCreateCourse} className={styles.createButton}>
                            Create Course
                        </button>
                        <table className={styles.courseTable}>
                            <thead>
                                <tr>
                                    <th className={styles.TitleCell}>Title</th>
                                    <th className={styles.CategoryCell}>Category</th>
                                    <th>Is Published</th>
                                    <th className={styles.DateCell}>Created at</th>
                                    <th className={styles.DateCell}>Updated at</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map((course) => (
                                    <tr key={course.id} className={styles.courseRow}>
                                        <td>{course.title}</td>
                                        <td>{course.category}</td>
                                        <td>
                                            {course.is_published ? (
                                                <i className="fa-regular fa-circle-check" style={{ color: 'green' }}></i>
                                            ) : (
                                                <i className="fa-regular fa-circle-xmark" style={{ color: 'red' }}></i>
                                            )}
                                        </td>

                                        <td>{new Date(course.created_at).toLocaleString()}</td>
                                        <td>{new Date(course.updated_at).toLocaleString()}</td>
                                        <td>
                                            <i
                                                className="fa-solid fa-ellipsis"
                                                onClick={() => toggleMenu(course.id)}
                                                style={{ cursor: 'pointer' }}
                                            ></i>
                                            {menuOpen === course.id && (
                                                <div className={styles.dropdownMenu}>
                                                    <button onClick={() => handleEditCourse(course.id)} className={styles.editButton}>
                                                        <i className="fa-solid fa-pen-to-square" style={{ marginRight: '5px' }}></i>Edit
                                                    </button>
                                                    <button onClick={() => handleDeleteCourse(course.id)} className={styles.deleteButton}>
                                                        <i className="fa-solid fa-trash" style={{ marginRight: '5px' }}></i>Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Courses;
