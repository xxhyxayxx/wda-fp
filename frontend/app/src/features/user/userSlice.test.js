import userReducer, { login } from './userSlice';

describe('userSlice', () => {
  const initialState = {
    isLoggedIn: false,
    userInfo: null,
  };

  it('should return the initial state', () => {
    expect(userReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });
});

describe('userSlice', () => {
    it('should handle login', () => {
        const previousState = { isLoggedIn: false, userInfo: null };
        const action = login({ email: 'test@example.com', name: 'Test User' });
        const expectedState = {
          isLoggedIn: true,
          userInfo: { email: 'test@example.com', name: 'Test User' },
        };
        expect(userReducer(previousState, action)).toEqual(expectedState);
    });      
});
