import { render, screen } from '@testing-library/react';
import App from './App';

test('renders admin login entry point', () => {
  render(<App />);
  expect(screen.getByText(/admin login/i)).toBeInTheDocument();
});
