import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchConversations } from '../features/message/messageSlice';
import { Link } from 'react-router-dom';

const ConversationList = () => {
  const dispatch = useDispatch();
  const { conversations, status, error } = useSelector((state) => state.message);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  if (status === 'loading') return <div>Loading conversations...</div>;
  if (error) return <div>Error: {error}</div>;

  if (conversations.length === 0) {
    return (
      <div>
        <div>No conversations available. Start a conversation!</div>
      </div>
    );
  }

  return (
    <div>
      <h2>Conversations</h2>
      <ul>
        {conversations.map((conversation) => (
          <li key={conversation.other_user.id} style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src={conversation.other_user.profile_image}
                alt={`${conversation.other_user.name}'s profile`}
                style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '1rem' }}
              />
              <div>
                <div>
                  <strong>{conversation.other_user.name}</strong>
                </div>
                <div>
                  <strong>Last message:</strong> {conversation.last_message.content}
                </div>
                <div>
                  <strong>Time:</strong>{' '}
                  {new Date(conversation.last_message.timestamp).toLocaleString()}
                </div>
                <Link
                  to={`/messages/${conversation.other_user.id}`}
                  style={{ color: 'blue', textDecoration: 'underline' }}
                >
                  View Details
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConversationList;
