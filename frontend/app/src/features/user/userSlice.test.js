// userSlice.test.js
import userReducer, { login, register } from './userSlice';

describe('userSlice', () => {
  const initialState = {
    isLoggedIn: false,
    userInfo: null,
  };

  it('should return the initial state', () => {
    expect(userReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle login', () => {
    const previousState = { isLoggedIn: false, userInfo: null };
    const action = login({ email: 'test@example.com', name: 'Test User' });
    const expectedState = {
      isLoggedIn: true,
      userInfo: { email: 'test@example.com', name: 'Test User' },
    };
    expect(userReducer(previousState, action)).toEqual(expectedState);
  });

  // Registerアクションに対するテストを追加
  it('should handle register', () => {
    const previousState = { isLoggedIn: false, userInfo: null };
    const action = register({ email: 'newuser@example.com', name: 'New User' });
    const expectedState = {
      isLoggedIn: false,  // 登録時にはログインはしていない
      userInfo: { email: 'newuser@example.com', name: 'New User' },
    };
    expect(userReducer(previousState, action)).toEqual(expectedState);
  });
});
