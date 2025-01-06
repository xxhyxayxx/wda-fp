import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/SearchBar.module.css';

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const navigate = useNavigate();

    // 入力が変更されるたびに検索リクエストを送る
    useEffect(() => {
        if (query.trim() === '') {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const fetchSuggestions = async () => {
            try {
                const response = await fetch(`/api/search/?q=${query}`);
                const data = await response.json();
                setSuggestions(data);
                setShowSuggestions(true);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            }
        };

        const debounceTimeout = setTimeout(() => {
            fetchSuggestions();
        }, 300); // デバウンス

        return () => clearTimeout(debounceTimeout);
    }, [query]);

    const handleInputChange = (e) => {
        setQuery(e.target.value);
    };

    const handleSuggestionClick = (suggestion) => {
        navigate(`/profile/${suggestion.id}`); // 詳細ページに遷移
        setShowSuggestions(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // フォーム送信を防止

            if (showSuggestions) {
                // 候補が表示されている場合、エンターを無効化
                return;
            }

            if (suggestions.length === 1) {
                // 候補が一人の場合、直接詳細ページに遷移
                navigate(`/profile/${suggestions[0].id}`);
            } else {
                // 候補が複数またはゼロの場合、検索結果ページに遷移
                navigate(`/search-results?q=${query}`);
            }

            setShowSuggestions(false);
        }
    };

    const handleBlur = () => {
        // 候補を非表示にする（一定の遅延を入れてクリック操作を考慮）
        setTimeout(() => setShowSuggestions(false), 200);
    };

    return (
        <div className={styles.searchBarContainer}>
            <input
                type="text"
                value={query}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                onBlur={handleBlur}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search for a user..."
                className={styles.searchInput}
            />
            {showSuggestions && suggestions.length > 0 && (
                <ul className={styles.suggestionsList}>
                    {suggestions.map((suggestion) => (
                        <li
                            key={suggestion.id}
                            className={styles.suggestionItem}
                            onClick={() => handleSuggestionClick(suggestion)}
                        >
                            {suggestion.name} ({suggestion.email})
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchBar;
