import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // 追加
import { fetchCourses } from '../features/course/courseSlice';
import { enrollInCourse, fetchEnrollments } from '../features/course/enrollmentSlice';
import NavBar from './NavBar';
import styles from './styles/StudentCourses.module.css';

const StudentCourses = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate(); // 追加

    const { courses, loading: coursesLoading, error: coursesError } = useSelector((state) => state.course);
    const { enrollments, loading: enrollmentsLoading, error: enrollmentsError } = useSelector((state) => state.enrollment);

    useEffect(() => {
        dispatch(fetchCourses());
        dispatch(fetchEnrollments());
    }, [dispatch]);

    if (coursesLoading || enrollmentsLoading) {
        return <div className={styles.loader}>Loading...</div>;
    }

    if (coursesError || enrollmentsError) {
        return <div className={styles.error}>Error: {coursesError || enrollmentsError}</div>;
    }

    const handleEnroll = async (courseId) => {
        try {
            await dispatch(enrollInCourse(courseId)).unwrap();
            dispatch(fetchEnrollments());
        } catch (error) {
            console.error('Enrollment failed:', error);
        }
    };

    const enrolledCourseIds = (enrollments || [])
        .map((enrollment) => enrollment?.course?.id)
        .filter(Boolean);

    return (
        <div className={styles.pageContainer}>
            <NavBar />
            <div className={styles.contentContainer}>
                <ul className={styles.courseList}>
                    {courses.map((course) => (
                        <li key={course.id} className={styles.courseCard}>
                            <p className={styles.courseCategory}>{course.category}</p>
                            <h2 className={styles.courseTitle}>{course.title}</h2>
                            <p className={styles.courseDescription}>{course.description}</p>

                            {/* Enrolled 済みかどうかを判定 */}
                            {enrolledCourseIds.includes(course.id) ? (
                                <>
                                    <span className={styles.enrolledBadge}>Enrolled</span>
                                    <button
                                        className={styles.enrollButton}
                                        onClick={() => navigate(`/student-courses/${course.id}`)}
                                    >
                                        Go to Course
                                    </button>
                                </>
                            ) : (
                                <button
                                    className={styles.enrollButton}
                                    onClick={() => handleEnroll(course.id)}
                                >
                                    Enroll
                                </button>
                            )}

                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default StudentCourses;
