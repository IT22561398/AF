import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from '../components/Register';
import authService from '../services/auth.service';

// Mock the auth service
jest.mock('../services/auth.service', () => ({
  signup: jest.fn()
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders registration form', () => {
    render(<Register />);

    expect(screen.getByText(/create a new account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  test('allows user to enter registration details', () => {
    render(<Register />);

    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(usernameInput).toHaveValue('testuser');
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  test('toggles password visibility', () => {
    render(<Register />);

    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Find all buttons and select the toggle button (not the Sign up button)
    const buttons = screen.getAllByRole('button');
    const toggleBtn = buttons.find(btn => !btn.textContent.includes('Sign up'));

    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('submits the form and shows success message', async () => {
    const successMessage = 'Registration successful!';
    authService.signup.mockResolvedValueOnce({ data: { message: successMessage } });

    render(<Register />);

    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const termsCheckbox = screen.getByLabelText(/i agree to the/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(termsCheckbox);

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.signup).toHaveBeenCalledWith('testuser', 'test@example.com', 'password123');
    });

    expect(await screen.findByText(successMessage)).toBeInTheDocument();
  });

  test('shows error message on registration failure', async () => {
    const errorMessage = 'Username already taken';
    authService.signup.mockRejectedValueOnce({
      response: { data: { message: errorMessage } }
    });

    render(<Register />);

    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const termsCheckbox = screen.getByLabelText(/i agree to the/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(usernameInput, { target: { value: 'existinguser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(termsCheckbox);

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.signup).toHaveBeenCalledWith('existinguser', 'test@example.com', 'password123');
    });

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });

  test('disables submit button while loading', async () => {
    // Mock the signup function to return a promise that doesn't resolve during the test
    authService.signup.mockImplementation(() => new Promise(resolve => { }));

    render(<Register />);

    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const termsCheckbox = screen.getByLabelText(/i agree to the/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(termsCheckbox);

    fireEvent.click(submitButton);

    // Wait for the button to be disabled
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });

    // Check for the loading spinner
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });
});
