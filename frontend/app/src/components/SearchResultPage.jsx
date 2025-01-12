import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom'; // useNavigateを追加
import { fetchUserDetails } from '../features/user/userSlice';

const SearchResultPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate(); // navigate を定義
  const { selectedUser, status, error } = useSelector((state) => state.user);

  useEffect(() => {
    if (id) {
      dispatch(fetchUserDetails(id));
    }
  }, [dispatch, id]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  // "Send Message" button handler
  const handleSendMessage = () => {
    navigate(`/messages/${id}`); // MessageDetailへの遷移
  };

  return (
    <div>
      <h1>User Details</h1>
      {selectedUser ? (
        <div>
          <p>Name: {selectedUser.name}</p>
          <p>Email: {selectedUser.email}</p>
          <p>User Type: {selectedUser.user_type}</p>
          <img src={selectedUser.profile_image} alt={`${selectedUser.name}'s profile`} />
          {/* Send Message ボタンを追加 */}
          <button onClick={handleSendMessage} style={{ marginTop: '20px', padding: '10px 20px' }}>
            Send Message
          </button>
        </div>
      ) : (
        <p>No user details found.</p>
      )}
    </div>
  );
};

export default SearchResultPage;
