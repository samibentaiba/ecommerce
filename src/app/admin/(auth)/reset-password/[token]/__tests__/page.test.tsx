import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResetPasswordPage from '../page';

// Mock the custom hook
jest.mock('../hook', () => ({
  useResetPassword: jest.fn(),
}));
const { useResetPassword } = require('../hook');

const mockParams = { token: 'test-token' };

function setupHookState(stateOverrides = {}) {
  const defaultState = {
    newPassword: '',
    setNewPassword: jest.fn(),
    confirmPassword: '',
    setConfirmPassword: jest.fn(),
    showPassword: false,
    setShowPassword: jest.fn(),
    showConfirmPassword: false,
    setShowConfirmPassword: jest.fn(),
    loading: false,
    success: false,
    error: '',
    handleSubmit: jest.fn((e) => e.preventDefault()),
  };
  (useResetPassword as jest.Mock).mockReturnValue({ ...defaultState, ...stateOverrides });
}

describe('ResetPasswordPage UI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the reset password form', () => {
    setupHookState();
    render(<ResetPasswordPage params={mockParams} />);
    expect(screen.getByText('Reset your password')).toBeInTheDocument();
    expect(screen.getByText('Enter your new password below')).toBeInTheDocument();
    expect(screen.getByLabelText('New password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm new password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
  });

  it('renders back to sign in link', () => {
    setupHookState();
    render(<ResetPasswordPage params={mockParams} />);
    expect(screen.getByText('Back to sign in')).toBeInTheDocument();
  });

  it('displays password requirements', () => {
    setupHookState();
    render(<ResetPasswordPage params={mockParams} />);
    expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument();
  });

  it('disables submit button when loading or fields are empty', () => {
    setupHookState({ loading: true });
    render(<ResetPasswordPage params={mockParams} />);
    expect(screen.getByRole('button', { name: /reset password/i })).toBeDisabled();
  });

  it('shows error alert when error is present', () => {
    setupHookState({ error: 'Some error' });
    render(<ResetPasswordPage params={mockParams} />);
    expect(screen.getByText('Some error')).toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    setupHookState({ loading: true, newPassword: 'a', confirmPassword: 'a' });
    render(<ResetPasswordPage params={mockParams} />);
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
  });

  it('shows success state after successful reset', () => {
    setupHookState({ success: true });
    render(<ResetPasswordPage params={mockParams} />);
    expect(screen.getByText('Password reset successful')).toBeInTheDocument();
    expect(screen.getByText('Your password has been reset. You will be redirected to the login page shortly.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go to login/i })).toBeInTheDocument();
  });

  it('toggles password visibility', () => {
    const setShowPassword = jest.fn();
    const setShowConfirmPassword = jest.fn();
    setupHookState({ setShowPassword, setShowConfirmPassword });
    render(<ResetPasswordPage params={mockParams} />);
    const buttons = screen.getAllByRole('button', { name: '' });
    fireEvent.click(buttons[0]);
    expect(setShowPassword).toHaveBeenCalled();
    fireEvent.click(buttons[1]);
    expect(setShowConfirmPassword).toHaveBeenCalled();
  });

  it('has proper accessibility labels', () => {
    setupHookState();
    render(<ResetPasswordPage params={mockParams} />);
    expect(screen.getByLabelText('New password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm new password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
  });

  it('has proper form structure', () => {
    setupHookState();
    render(<ResetPasswordPage params={mockParams} />);
    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();
    const newPasswordInput = screen.getByLabelText('New password');
    const confirmPasswordInput = screen.getByLabelText('Confirm new password');
    expect(form).toContainElement(newPasswordInput);
    expect(form).toContainElement(confirmPasswordInput);
  });
}); 