import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

describe('Parallel Space Mobile App', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renders full app UI without crashing', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | null = null;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<App />);
      jest.advanceTimersByTime(500);
    });
    expect(renderer).toBeTruthy();
  });
});
