import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import authService from './services/auth.service';

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn().mockResolvedValue({ data: [] }),
  post: jest.fn().mockResolvedValue({ data: {} }),
  defaults: { withCredentials: false }
}));

// Mock auth service
jest.mock('./services/auth.service', () => ({
  getCurrentUser: jest.fn(),
  logout: jest.fn()
}));

describe('App Integration Tests', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock API responses
    require('axios').get.mockResolvedValue({
      data: [
        {
          name: { common: 'Germany' },
          population: 83240525,
          region: 'Europe',
          capital: ['Berlin'],
          flags: { png: 'https://example.com/germany-flag.png' },
          cca3: 'DEU',
          subregion: 'Western Europe',
          tld: ['.de'],
          currencies: { EUR: { name: 'Euro' } },
          languages: { deu: 'German' },
          borders: ['FRA', 'BEL', 'POL']
        }
      ]
    });
  });

  test('authenticated user can view profile and logout', async () => {
    // Mock authenticated user
    const mockUser = {
      username: 'testuser',
      email: 'test@example.com',
      roles: ['ROLE_USER']
    };
    authService.getCurrentUser.mockReturnValue(mockUser);
    
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Check if username is displayed in the navigation
    expect(screen.getByText('testuser')).toBeInTheDocument();
    
    // Open the dropdown first (because the Sign out button is in a dropdown)
    const userDropdownButton = screen.getByText('testuser').closest('button');
    fireEvent.click(userDropdownButton);
    
    // Find and click the Sign out button in the dropdown
    fireEvent.click(screen.getByText('Sign out'));
    
    // Check if auth service logout was called
    expect(authService.logout).toHaveBeenCalledTimes(1);
  });
});
