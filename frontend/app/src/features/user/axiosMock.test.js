// axiosMock.test.js
import axios from 'axios';

jest.mock('axios');

describe('axios basic mock test', () => {
  it('should mock axios and return resolved value', async () => {
    axios.post.mockResolvedValueOnce({ data: { message: 'success' } });

    const response = await axios.post('/some-url');
    expect(response.data.message).toBe('success');
  });
});
