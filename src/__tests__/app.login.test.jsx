// src/__tests__/app.login.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('Login flow', () => {
  test('renders login form when logged out', () => {
    render(<App />);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test('logs in and shows logout', async () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'admin' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password' },
    });

    // Button text in UI is "Sign in" (older variants used "Login").
    fireEvent.click(screen.getByRole('button', { name: /sign in|login/i }));

    const logoutBtn = await screen.findByRole('button', { name: /logout/i });
    expect(logoutBtn).toBeInTheDocument();
  });
});