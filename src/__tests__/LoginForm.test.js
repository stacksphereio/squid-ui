import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

test('logs in with valid credentials and shows Logout button', async () => {
  render(<App />);

  fireEvent.change(screen.getByLabelText(/username/i), {
    target: { value: 'demo' }
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: 'password' }
  });

  // Accept either “Sign in” (actual UI) or “Login” (old test expectation)
  const submitBtn =
    screen.queryByRole('button', { name: /sign in/i }) ||
    screen.getByRole('button', { name: /(sign in|login)/i });
    

  fireEvent.click(submitBtn);

  const logoutBtn = await screen.findByRole('button', { name: /logout/i });
  expect(logoutBtn).toBeInTheDocument();
});