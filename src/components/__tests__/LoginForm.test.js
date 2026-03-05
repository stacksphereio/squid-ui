// src/components/__tests__/LoginForm.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginForm from '../LoginForm';
import * as authApi from '../../api/auth';

// Mock the auth API
jest.mock('../../api/auth');

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Blank Credentials Validation', () => {
    it('should show error when both username and password are blank', async () => {
      const mockOnLogin = jest.fn();
      render(<LoginForm onLogin={mockOnLogin} />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter both username and password.')).toBeInTheDocument();
      });

      expect(authApi.login).not.toHaveBeenCalled();
      expect(mockOnLogin).not.toHaveBeenCalled();
    });

    it('should show error when username is blank', async () => {
      const mockOnLogin = jest.fn();
      render(<LoginForm onLogin={mockOnLogin} />);

      const passwordInput = screen.getByLabelText(/password/i);
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter both username and password.')).toBeInTheDocument();
      });

      expect(authApi.login).not.toHaveBeenCalled();
      expect(mockOnLogin).not.toHaveBeenCalled();
    });

    it('should show error when password is blank', async () => {
      const mockOnLogin = jest.fn();
      render(<LoginForm onLogin={mockOnLogin} />);

      const usernameInput = screen.getByLabelText(/username/i);
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter both username and password.')).toBeInTheDocument();
      });

      expect(authApi.login).not.toHaveBeenCalled();
      expect(mockOnLogin).not.toHaveBeenCalled();
    });

    it('should show error when username is only whitespace', async () => {
      const mockOnLogin = jest.fn();
      render(<LoginForm onLogin={mockOnLogin} />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);

      fireEvent.change(usernameInput, { target: { value: '   ' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter both username and password.')).toBeInTheDocument();
      });

      expect(authApi.login).not.toHaveBeenCalled();
    });

    it('should show error when password is only whitespace', async () => {
      const mockOnLogin = jest.fn();
      render(<LoginForm onLogin={mockOnLogin} />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: '   ' } });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter both username and password.')).toBeInTheDocument();
      });

      expect(authApi.login).not.toHaveBeenCalled();
    });
  });

  describe('Valid Credentials', () => {
    it('should call login API with valid credentials', async () => {
      authApi.login.mockResolvedValue('ok');
      const mockOnLogin = jest.fn();

      render(<LoginForm onLogin={mockOnLogin} />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(authApi.login).toHaveBeenCalledWith('testuser', 'password123');
        expect(mockOnLogin).toHaveBeenCalled();
      });
    });
  });

  describe('Authentication Errors', () => {
    it('should display invalid credentials error', async () => {
      authApi.login.mockRejectedValue(new Error('Invalid username or password. Please try again.'));
      const mockOnLogin = jest.fn();

      render(<LoginForm onLogin={mockOnLogin} />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid username or password. Please try again.')).toBeInTheDocument();
      });

      expect(mockOnLogin).not.toHaveBeenCalled();
    });

    it('should display service unavailable error', async () => {
      authApi.login.mockRejectedValue(new Error('Authentication service is temporarily unavailable. Please try again later.'));
      const mockOnLogin = jest.fn();

      render(<LoginForm onLogin={mockOnLogin} />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Authentication service is temporarily unavailable. Please try again later.')).toBeInTheDocument();
      });

      expect(mockOnLogin).not.toHaveBeenCalled();
    });
  });

  describe('Form State', () => {
    it('should disable submit button while submitting', async () => {
      authApi.login.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('ok'), 100)));
      const mockOnLogin = jest.fn();

      render(<LoginForm onLogin={mockOnLogin} />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      // Button should be disabled during submission
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent('Signing in…');

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
        expect(submitButton).toHaveTextContent('Sign in');
      });
    });
  });
});
