// src/__tests__/app.nav.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NavBar from '../components/NavBar';

describe('NavBar', () => {
  const mockHandlers = {
    onGoHome: jest.fn(),
    onOpenAbout: jest.fn(),
    onOpenAdminHealth: jest.fn(),
    onLogout: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders navigation and shows About/Service Health buttons when menu opened', () => {
    render(
      <NavBar
        isLoggedIn={true}
        adminHealthEnabled={true}
        onGoHome={mockHandlers.onGoHome}
        onOpenAbout={mockHandlers.onOpenAbout}
        onOpenAdminHealth={mockHandlers.onOpenAdminHealth}
        onLogout={mockHandlers.onLogout}
        username="TestUser"
      />
    );

    // Click About ▾ to open menu
    const aboutBtn = screen.getByRole('button', { name: /about/i });
    fireEvent.click(aboutBtn);

    // Now the Overview item should be visible
    expect(screen.getByRole('menuitem', { name: /overview/i })).toBeInTheDocument();

    // Click Admin ▾ to open admin menu
    const adminBtn = screen.getByRole('button', { name: /admin/i });
    fireEvent.click(adminBtn);

    // Now the Service Health item should be visible
    expect(screen.getByRole('menuitem', { name: /service health/i })).toBeInTheDocument();
  });

  test('renders Logout button with username', () => {
    render(
      <NavBar
        isLoggedIn={true}
        adminHealthEnabled={false}
        onGoHome={mockHandlers.onGoHome}
        onOpenAbout={mockHandlers.onOpenAbout}
        onOpenAdminHealth={mockHandlers.onOpenAdminHealth}
        onLogout={mockHandlers.onLogout}
        username="Tester"
      />
    );

    expect(screen.getByText(/hello, tester/i)).toBeInTheDocument();
    const logoutBtn = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutBtn);
    expect(mockHandlers.onLogout).toHaveBeenCalled();
  });
});