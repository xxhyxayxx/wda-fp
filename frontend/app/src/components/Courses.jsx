import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCourses, deleteCourse } from '../features/course/courseSlice'; // deleteCourseを追加
import styles from './styles/Courses.module.css';

const Courses = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { courses, loading, error } = useSelector((state) => state.course);

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

    // 編集ボタンのハンドラー
    const handleEditCourse = (courseId) => {
        navigate(`/edit-course/${courseId}`);
    };

    // 削除ボタンのハンドラー
    const handleDeleteCourse = async (courseId) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                await dispatch(deleteCourse(courseId)).unwrap();
                console.log('Course deleted:', courseId);
            } catch (e) {
                console.error('Failed to delete course:', e);
            }
        }
    };

    const handleCreateCourse = () => {
        navigate('/create-course');
    };

    return (
        <div className={styles.coursesContainer}>
            <h1 className={styles.title}>Courses</h1>
            {loading ? (
                <p>Loading courses...</p>
            ) : error ? (
                <p>Error: {error}</p>
            ) : (
                <>
                    <button onClick={handleCreateCourse} className={styles.createButton}>
                        Create Course
                    </button>
                    <ul className={styles.courseList}>
                        {courses.map((course) => (
                            <li key={course.id} className={styles.courseItem}>
                                <div>Title: {course.title}</div>
                                <div>Category: {course.category}</div>
                                <div>Is Published: {course.is_published ? '✔️' : '❌'}</div>
                                <div>Created by: {course.created_by}</div>
                                <div>Created at: {new Date(course.created_at).toLocaleString()}</div>
                                <div>Updated at: {new Date(course.updated_at).toLocaleString()}</div>
                                <button
                                    onClick={() => handleEditCourse(course.id)}
                                    className={styles.editButton}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteCourse(course.id)}
                                    className={styles.deleteButton}
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
};

export default Courses;
