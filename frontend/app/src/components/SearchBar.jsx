import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { searchUsers, resetSearchResults } from '../features/user/userSlice';
import styles from './styles/SearchBar.module.css';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { searchResults, status, error } = useSelector((state) => state.user);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim() === '') {
      dispatch(resetSearchResults());
    } else {
      dispatch(searchUsers(value));
    }
  };

  const handleSuggestionClick = (user) => {
    navigate(`/profile/${user.id}`);
    dispatch(resetSearchResults());
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults.length === 1) {
        navigate(`/profile/${searchResults[0].id}`);
        dispatch(resetSearchResults());
      }
    }
  };

  return (
    <div className={styles.searchBarContainer}>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder="Search for a user..."
        className={styles.searchInput}
      />
      {status === 'loading' && <div>Loading...</div>}
      {error && <div className={styles.errorMessage}>{error}</div>}
      {searchResults.length > 0 && (
        <ul className={styles.suggestionsList}>
          {searchResults.map((user) => (
            <li
              key={user.id}
              className={styles.suggestionItem}
              onClick={() => handleSuggestionClick(user)}
            >
              {user.name} ({user.email})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
