import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import SignInPage from '../page';
import { useToast } from '@/hooks/use-toast';
import { signIn } from 'next-auth/react';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => ({ get: () => null })),
}));

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

// Mock signIn from next-auth/react
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

global.fetch = jest.fn();

const mockRouter = {
  push: jest.fn(),
};
const mockToast = jest.fn();

describe('SignInPage UI/Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (global.fetch as jest.Mock).mockClear();
    const { useSearchParams } = require('next/navigation');
    (useSearchParams as jest.Mock).mockImplementation(() => ({ get: () => null }));
    (signIn as jest.Mock).mockClear();
  });

  it('should render the sign in form', () => {
    render(<SignInPage />);
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByText('Access your admin dashboard')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should render forgot password link', () => {
    render(<SignInPage />);
    expect(screen.getByText('Forgot your password?')).toBeInTheDocument();
  });

  it('should render register link', () => {
    render(<SignInPage />);
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    expect(screen.getByText('Create one here')).toBeInTheDocument();
  });

  it('should disable submit button when fields are empty', () => {
    render(<SignInPage />);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when both fields are filled', async () => {
    const user = userEvent.setup();
    render(<SignInPage />);
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('should show password when toggle button is clicked', async () => {
    const user = userEvent.setup();
    render(<SignInPage />);
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const toggleButton = screen.getByRole('button', { name: '' }); // Eye icon button
    expect(passwordInput.type).toBe('password');
    await user.click(toggleButton);
    expect(passwordInput.type).toBe('text');
    await user.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });

  it('should validate email format', async () => {
    const user = userEvent.setup();
    render(<SignInPage />);
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.type(emailInput, 'invalid-email');
    await user.type(passwordInput, 'password123');
    expect(submitButton).not.toBeDisabled();
    await user.clear(emailInput);
    await user.type(emailInput, 'test@example.com');
    expect(submitButton).not.toBeDisabled();
  });

  it('should call signIn handler on submit', async () => {
    const user = userEvent.setup();
    (signIn as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, user: {} }), success: true });
    render(<SignInPage />);
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    await waitFor(() => {
      expect(signIn).toHaveBeenCalled();
    });
  });

  it('should show loading state during login', async () => {
    const user = userEvent.setup();
    (signIn as jest.Mock).mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve({ ok: true, json: async () => ({ success: true, user: {} }), success: true }), 100)));
    render(<SignInPage />);
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
  });

  it('should navigate to forgot password page', async () => {
    const user = userEvent.setup();
    render(<SignInPage />);
    const forgotPasswordLink = screen.getByText('Forgot your password?');
    await user.click(forgotPasswordLink);
    expect(forgotPasswordLink).toBeInTheDocument();
  });

  it('should navigate to register page', async () => {
    const user = userEvent.setup();
    render(<SignInPage />);
    const registerLink = screen.getByText('Register here');
    await user.click(registerLink);
    expect(registerLink).toBeInTheDocument();
  });

  it('should have proper labels and ARIA attributes', () => {
    render(<SignInPage />);
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should have proper form structure', () => {
    render(<SignInPage />);
    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    expect(form).toContainElement(emailInput);
    expect(form).toContainElement(passwordInput);
  });

  it('should have proper 2FA form structure', async () => {
    const user = userEvent.setup();
    (signIn as jest.Mock).mockResolvedValueOnce({ error: '2FA_REQUIRED' });
    render(<SignInPage />);
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /two-factor authentication/i })).toBeInTheDocument();
      expect(screen.getByLabelText('Authentication Code')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /verify code/i })).toBeInTheDocument();
    });
  });
}); 