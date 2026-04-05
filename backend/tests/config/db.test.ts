jest.mock('pg', () => {
  const mockClient = {
    query: jest.fn().mockResolvedValue({ rows: [{ '?column?': 1 }] }),
    release: jest.fn(),
  };
  const mockPool = {
    connect: jest.fn().mockResolvedValue(mockClient),
    end: jest.fn(),
  };
  return { Pool: jest.fn(() => mockPool) };
});

jest.mock('@config/env', () => ({
  env: {
    DATABASE_URL: 'postgresql://localhost/test_db',
    NODE_ENV: 'test',
  },
}));

describe('database connection', () => {
  it('should connect and release the client', async () => {
    const { pool, testConnection } = await import('@config/db');
    await testConnection();

    expect(pool.connect).toHaveBeenCalled();
    const mockClient = await (pool.connect as jest.Mock).mock.results[0].value;
    expect(mockClient.query).toHaveBeenCalledWith('SELECT 1');
    expect(mockClient.release).toHaveBeenCalled();
  });
});
