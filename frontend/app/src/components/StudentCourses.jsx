import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCourses } from '../features/course/courseSlice';
import { enrollInCourse, fetchEnrollments } from '../features/course/enrollmentSlice';
import NavBar from './NavBar';
import styles from './styles/StudentCourses.module.css';

const StudentCourses = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { courses, loading: coursesLoading, error: coursesError } = useSelector((state) => state.course);
    const { enrollments, loading: enrollmentsLoading, error: enrollmentsError } = useSelector((state) => state.enrollment);

    useEffect(() => {
        dispatch(fetchCourses());
        dispatch(fetchEnrollments());
    }, [dispatch]);

    // デバッグ用に enrollments をログ出力
    useEffect(() => {
        if (enrollments) {
            console.log('Enrollments:', enrollments);
        }
    }, [enrollments]);

    if (coursesLoading || enrollmentsLoading) {
        return <div className={styles.loader}>Loading...</div>;
    }

    if (coursesError || enrollmentsError) {
        return <div className={styles.error}>Error: {coursesError || enrollmentsError}</div>;
    }

    const handleEnroll = async (courseId) => {
        try {
            await dispatch(enrollInCourse(courseId)).unwrap();
            await dispatch(fetchCourses());
            await dispatch(fetchEnrollments());
        } catch (error) {
            console.error('Enrollment failed:', error);
        }
    };    

    const enrolledCourses = enrollments
        ?.filter((enrollment) => enrollment?.status && enrollment.status !== 'BLOCKED') // BLOCKED を除外
        .map((enrollment) => enrollment?.course?.id)
        .filter(Boolean);

    console.log('Enrolled Courses IDs:', enrolledCourses);

    return (
        <div className={styles.pageContainer}>
            <NavBar />
            <div className={styles.contentContainer}>
                <ul className={styles.courseList}>
                    {courses
                        .filter((course) => {
                            const isBlocked = enrollments.some(
                                (enrollment) => enrollment?.course?.id === course.id && enrollment?.status === 'BLOCKED'
                            );
                            console.log(`Rendering Course ID: ${course.id}, Is Blocked: ${isBlocked}`);
                            return !isBlocked;
                        })                        
                        .map((course) => {
                            const isEnrolled = enrolledCourses.includes(course.id);
                            return (
                                <li key={course.id} className={styles.courseCard}>
                                    <p className={styles.courseCategory}>{course.category}</p>
                                    <h2 className={styles.courseTitle}>{course.title}</h2>
                                    <p className={styles.courseDescription}>{course.description}</p>

                                    {isEnrolled ? (
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
                            );
                        })}
                </ul>
            </div>
        </div>
    );
};

export default StudentCourses;
