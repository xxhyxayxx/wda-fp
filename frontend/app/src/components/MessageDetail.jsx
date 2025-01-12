import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom'; // useParamsを使用
import { fetchMessages, sendMessage, markMessageAsRead } from '../features/message/messageSlice';

const MessageDetail = () => {
    const { receiverId } = useParams(); // URLからreceiverIdを取得
    const dispatch = useDispatch();
    const { messages = [], status, error } = useSelector((state) => state.message || {});
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);

    // メッセージの取得
    useEffect(() => {
        if (receiverId) {
            dispatch(fetchMessages(receiverId));
        }
    }, [dispatch, receiverId]);

    // 吹き出しを自動でスクロール
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // メッセージの既読化
    useEffect(() => {
        messages.forEach((message) => {
            if (!message.is_read && message.receiver === receiverId) {
                dispatch(markMessageAsRead(message.id));
            }
        });
    }, [messages, dispatch, receiverId]);

    // メッセージの送信
    const handleSendMessage = async () => {
        if (newMessage.trim()) {
            setIsSending(true);

            // デバッグ用: 送信するペイロードをログ出力
            console.log("Sending message with receiver and content:", {
                receiver: receiverId,
                content: newMessage,
            });

            await dispatch(
                sendMessage({
                    receiver: receiverId, // 受信者のID
                    content: newMessage,  // メッセージ内容
                })
            );

            setNewMessage('');
            setIsSending(false);
        }
    };


    // Enterキーで送信
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isSending) {
            handleSendMessage();
        }
    };

    if (status === 'loading') return <div>Loading messages...</div>;
    if (error) return <div style={{ color: 'red', padding: '10px' }}>Error: {error}</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px', backgroundColor: '#f8f9fa' }}>
                {messages.length === 0 ? (
                    <div>No messages yet</div>
                ) : (
                    messages.map((message) => (
                        <div key={message.id}>{message.content}</div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>
            <div>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                <button onClick={handleSendMessage} disabled={isSending}>
                    Send
                </button>
            </div>
        </div>
    );
};

export default MessageDetail;
