import React, { useState } from "react";
import { useDispatch } from "react-redux";
import Modal from "react-modal";
import { createFeedback } from "../features/course/feedbackSlice";

Modal.setAppElement("#root"); // 必要に応じて調整

const FeedbackModal = ({ isOpen, onClose, enrollmentId }) => {
    const [rating, setRating] = useState(""); // 初期値は空文字列
    const [comment, setComment] = useState("");
    const [error, setError] = useState(null);
    const dispatch = useDispatch();

    const handleSubmit = () => {
        const numericRating = parseInt(rating, 10); // 数値に変換
        console.log("Rating before dispatch:", typeof numericRating, numericRating);
    
        if (!numericRating) {
            setError("Please select a rating.");
            return;
        }
    
        dispatch(
            createFeedback({
                enrollment_id: enrollmentId,
                rating: numericRating, // 数値として送信
                comment,
            })
        );
        setError(null);
        onClose();
    };        

    return (
        <Modal isOpen={isOpen} onRequestClose={onClose} contentLabel="Feedback Modal">
            <h2>Give Feedback</h2>
            <div>
                <label>
                    Rating:
                    <select
                        value={rating}
                        onChange={(e) => setRating(e.target.value)} // 数値を選択する
                    >
                        <option value="">選択してください</option> {/* 初期値 */}
                        {[1, 2, 3, 4, 5].map((star) => (
                            <option key={star} value={star}>
                                {star} Stars
                            </option>
                        ))}
                    </select>
                </label>
            </div>
            {error && <p style={{ color: "red" }}>{error}</p>} {/* エラー表示 */}
            <div>
                <label>
                    Comment:
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Enter your feedback"
                    />
                </label>
            </div>
            <button onClick={handleSubmit}>Submit</button>
            <button onClick={onClose}>Cancel</button>
        </Modal>
    );
};

export default FeedbackModal;
