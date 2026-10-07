import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders without crashing', async () => {
    const { findByText } = render(<App />);
    expect(await findByText(/The calm place for conversations/i)).toBeInTheDocument();
  });
});
