import { store } from './index';

describe('Redux store', () => {
  it('initializes without throwing', () => {
    expect(store).toBeDefined();
    expect(store.getState()).toBeDefined();
  });

  it('has the api reducer key', () => {
    const state = store.getState();
    expect(state).toHaveProperty('api');
  });
});
