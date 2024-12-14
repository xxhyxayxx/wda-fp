import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchCourseStudents, toggleBlockStudent } from '../features/course/enrollmentSlice';
import styles from './styles/StudentDetailPage.module.css';

const StudentDetailPage = () => {
    const { courseId, studentId } = useParams();
    const dispatch = useDispatch();
    const { courseStudents, loading, error } = useSelector((state) => state.enrollment);

    const student = useMemo(
        () => courseStudents.find((s) => s.id === parseInt(studentId)),
        [courseStudents, studentId]
    );

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [blockReason, setBlockReason] = useState('');

    const handleToggleBlock = async () => {
        try {
            const reason = student.status === 'BLOCKED' ? '' : blockReason;
            await dispatch(toggleBlockStudent({ courseId, studentId, reason })).unwrap();
            setIsModalOpen(false);
            setBlockReason('');
            await dispatch(fetchCourseStudents(courseId)).unwrap(); // 最新状態を取得
        } catch (err) {
            console.error('Failed to toggle block status:', err);
        }
    };

    useEffect(() => {
        console.log('Course Students:', courseStudents);
        if (student) {
            console.log(`Student Status after fetch: ${student.status}`);
        }
    }, [courseStudents, student]);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('Fetching students for course:', courseId);
                await dispatch(fetchCourseStudents(courseId)).unwrap();
            } catch (error) {
                console.error('Failed to fetch course students:', error);
            }
        };
    
        if (!student && !loading) {
            fetchData();
        }
    }, [student, dispatch, courseId, loading]);    

    if (loading) return <p>Loading student details...</p>;
    if (error) return <p>Failed to load student details: {error}</p>;
    if (!student) return <p>Student data is not available. Try refreshing the page.</p>;

    return (
        <div className={styles.studentDetailContainer}>
            <img
                src={student.profile_image || 'default-profile.png'}
                alt={student.name}
                className={styles.studentImage}
            />
            <h2>{student.name}</h2>
            <p>Email: {student.email}</p>
            <p>Status: {student.status}</p>

            {student.status === 'BLOCKED' && student.block_reason && (
                <p>Reason: {student.block_reason}</p>
            )}

            <button
                onClick={() => setIsModalOpen(true)}
                className={styles.blockButton}
            >
                {student.status === 'BLOCKED' ? 'Unblock Student' : 'Block Student'}
            </button>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h3>{student.status === 'BLOCKED' ? 'Unblock Student' : 'Block Student'}</h3>
                        {student.status !== 'BLOCKED' && (
                            <textarea
                                className={styles.blockReasonTextarea}
                                placeholder="Enter reason for blocking (optional)"
                                value={blockReason}
                                onChange={(e) => setBlockReason(e.target.value)}
                            />
                        )}
                        <div className={styles.modalButtons}>
                            <button onClick={handleToggleBlock} className={styles.confirmButton}>
                                {student.status === 'BLOCKED' ? 'Confirm Unblock' : 'Confirm Block'}
                            </button>
                            <button onClick={() => setIsModalOpen(false)} className={styles.cancelButton}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDetailPage;
