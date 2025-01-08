import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMessages } from '../features/message/messageSlice';
import { Link } from 'react-router-dom'; 

const MessageList = ({ receiverId }) => {
  const dispatch = useDispatch();
  const { messages, status, error } = useSelector((state) => state.message);

  useEffect(() => {
    if (receiverId) {
      dispatch(fetchMessages(receiverId));
    }
  }, [dispatch, receiverId]);

  if (status === 'loading') return <div>Loading messages...</div>;
  if (error) return <div>Error: {error}</div>;

  // Check if there are no messages
  if (messages.length === 0) {
    return (
      <div>
        <div>No messages available. Start a conversation!</div>
      </div>
    );
  }

  return (
    <div>
      <h2>Messages</h2>
      <ul>
        {messages.map((message) => (
          <li key={message.id} style={{ fontWeight: message.is_read ? 'normal' : 'bold' }}>
            <div>
              <strong>From:</strong> {message.sender}
            </div>
            <div>
              <strong>To:</strong> {message.receiver}
            </div>
            <div>
              <strong>Message:</strong> {message.content}
            </div>
            <div>
              <strong>Time:</strong> {new Date(message.timestamp).toLocaleString()}
            </div>
            <Link to={`/messages/${message.sender_id}`} style={{ color: 'blue', textDecoration: 'underline' }}>
              View Details
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MessageList;
