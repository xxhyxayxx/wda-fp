import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses } from '../features/course/courseSlice';
import { enrollInCourse, fetchEnrollments } from '../features/course/enrollmentSlice';
import NavBar from './NavBar'; // NavBarをインポート
import styles from './styles/StudentCourses.module.css';

const StudentCourses = () => {
    const dispatch = useDispatch();

    // Reduxから必要な状態を取得
    const { courses, loading: coursesLoading, error: coursesError } = useSelector((state) => state.course);
    const { enrollments, loading: enrollmentsLoading, error: enrollmentsError } = useSelector((state) => state.enrollment);

    // 初回レンダリング時にデータを取得
    useEffect(() => {
        dispatch(fetchCourses()); // コース一覧取得
        dispatch(fetchEnrollments()); // 登録済みコース取得
    }, [dispatch]);

    // ローディング中の表示
    if (coursesLoading || enrollmentsLoading) {
        return <div className={styles.loader}>Loading...</div>;
    }

    // エラー発生時の表示
    if (coursesError || enrollmentsError) {
        return <div className={styles.error}>Error: {coursesError || enrollmentsError}</div>;
    }

    // 登録ボタンをクリックしたときのハンドラー
    const handleEnroll = async (courseId) => {
        try {
            await dispatch(enrollInCourse(courseId)).unwrap();
            dispatch(fetchEnrollments()); // 登録済みコースを再取得
        } catch (error) {
            console.error('Enrollment failed:', error);
        }
    };

    // 登録済みコースのIDリスト
    const enrolledCourseIds = (enrollments || [])
        .map((enrollment) => enrollment?.course?.id)
        .filter(Boolean);

    return (
        <div className={styles.pageContainer}>
            {/* NavBarの追加 */}
            <NavBar />
            <div className={styles.contentContainer}>
                <h1 className={styles.pageTitle}>Available Courses</h1>
                <div className={styles.courseList}>
                    {courses.map((course) => (
                        <div key={course.id} className={styles.courseCard}>
                            <h2 className={styles.courseTitle}>{course.title}</h2>
                            <p className={styles.courseDescription}>
                                {course.description.length > 100
                                    ? `${course.description.slice(0, 100)}...`
                                    : course.description}
                            </p>
                            <p className={styles.courseCategory}>Category: {course.category}</p>

                            {/* 登録済みのコースかどうかを判定 */}
                            {enrolledCourseIds.includes(course.id) ? (
                                <span className={styles.enrolledBadge}>Enrolled</span>
                            ) : (
                                <button
                                    className={styles.enrollButton}
                                    onClick={() => handleEnroll(course.id)}
                                >
                                    Enroll
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StudentCourses;
