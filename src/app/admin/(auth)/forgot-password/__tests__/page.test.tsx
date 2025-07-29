import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ForgotPasswordPage from '../page';

// Mock the custom hook
jest.mock('../hook', () => ({
  useForgotPassword: jest.fn(),
}));
const { useForgotPassword } = require('../hook');

function setupHookState(stateOverrides = {}) {
  const defaultState = {
    email: '',
    setEmail: jest.fn(),
    loading: false,
    success: false,
    error: '',
    setError: jest.fn(),
    handleSubmit: jest.fn((e) => e.preventDefault()),
    handleTryAgain: jest.fn(),
    isValidEmail: jest.fn(() => true),
  };
  (useForgotPassword as jest.Mock).mockReturnValue({ ...defaultState, ...stateOverrides });
}

describe('ForgotPasswordPage UI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the forgot password form', () => {
    setupHookState();
    render(<ForgotPasswordPage />);
    expect(screen.getByText('Forgot your password?')).toBeInTheDocument();
    expect(screen.getByText("Enter your email address and we'll send you a link to reset your password.")).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
  });

  it('renders back to sign in link', () => {
    setupHookState();
    render(<ForgotPasswordPage />);
    expect(screen.getByText('Back to sign in')).toBeInTheDocument();
  });

  it('disables submit button when loading', () => {
    setupHookState({ loading: true });
    render(<ForgotPasswordPage />);
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeDisabled();
  });

  it('disables submit button when email is empty or invalid', () => {
    setupHookState({ email: '', isValidEmail: () => false });
    render(<ForgotPasswordPage />);
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeDisabled();
  });

  it('shows error alert when error is present', () => {
    setupHookState({ error: 'Some error' });
    render(<ForgotPasswordPage />);
    expect(screen.getByText('Some error')).toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    setupHookState({ loading: true, email: 'a' });
    render(<ForgotPasswordPage />);
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
  });

  it('shows success state after successful request', () => {
    setupHookState({ success: true, email: 'test@example.com' });
    render(<ForgotPasswordPage />);
    expect(screen.getByText('Check your email')).toBeInTheDocument();
    expect(screen.getByText("We've sent a password reset link to test@example.com")).toBeInTheDocument();
    expect(screen.getByText("Didn't receive the email? Check your spam folder or try again.")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back to sign in/i })).toBeInTheDocument();
  });

  it('calls handleTryAgain when try again button is clicked', () => {
    const handleTryAgain = jest.fn();
    setupHookState({ success: true, email: 'test@example.com', handleTryAgain });
    render(<ForgotPasswordPage />);
    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(tryAgainButton);
    expect(handleTryAgain).toHaveBeenCalled();
  });

  it('has proper accessibility labels', () => {
    setupHookState();
    render(<ForgotPasswordPage />);
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
  });

  it('has proper form structure', () => {
    setupHookState();
    render(<ForgotPasswordPage />);
    const form = screen.getByRole('form');
    expect(form).toBeInTheDocument();
    const emailInput = screen.getByLabelText('Email address');
    expect(form).toContainElement(emailInput);
  });

  it('disables submit button when loading or email is empty or invalid', () => {
    const { unmount } = render(<ForgotPasswordPage />);
    setupHookState({ loading: true });
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeDisabled();
    unmount();
    setupHookState({ email: '', isValidEmail: () => false });
    render(<ForgotPasswordPage />);
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeDisabled();
  });
}); 