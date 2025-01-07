import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchUserDetails } from '../features/user/userSlice';

const SearchResultPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
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

  return (
    <div>
      <h1>User Details</h1>
      {selectedUser ? (
        <div>
          <p>Name: {selectedUser.name}</p>
          <p>Email: {selectedUser.email}</p>
          <p>User Type: {selectedUser.user_type}</p>
          <img src={selectedUser.profile_image} alt={`${selectedUser.name}'s profile`} />
        </div>
      ) : (
        <p>No user details found.</p>
      )}
    </div>
  );
};

export default SearchResultPage;
