import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RegisterPage from '../page';

// Mock the custom hook
jest.mock('../hook', () => ({
  useRegister: jest.fn(),
}));
const { useRegister } = require('../hook');

function setupHookState(stateOverrides = {}) {
  const defaultState = {
    name: '',
    setName: jest.fn(),
    email: '',
    setEmail: jest.fn(),
    password: '',
    setPassword: jest.fn(),
    confirmPassword: '',
    setConfirmPassword: jest.fn(),
    showPassword: false,
    setShowPassword: jest.fn(),
    showConfirmPassword: false,
    setShowConfirmPassword: jest.fn(),
    loading: false,
    error: '',
    setError: jest.fn(),
    registrationDisabled: false,
    handleSubmit: jest.fn((e) => e.preventDefault()),
  };
  (useRegister as jest.Mock).mockReturnValue({ ...defaultState, ...stateOverrides });
}

describe('RegisterPage UI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the registration form', () => {
    setupHookState();
    render(<RegisterPage />);
    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByText('Set up your admin account to get started')).toBeInTheDocument();
    expect(screen.getByLabelText('Full name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('renders sign in link', () => {
    setupHookState();
    render(<RegisterPage />);
    expect(screen.getByText('Already have an account?')).toBeInTheDocument();
    expect(screen.getByText('Sign in here')).toBeInTheDocument();
  });

  it('disables submit button when loading or fields are empty', () => {
    setupHookState({ loading: true });
    render(<RegisterPage />);
    expect(screen.getByRole('button', { name: /create account/i })).toBeDisabled();
  });

  it('shows error alert when error is present', () => {
    setupHookState({ error: 'Some error' });
    render(<RegisterPage />);
    expect(screen.getByText('Some error')).toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    setupHookState({ loading: true, name: 'a', email: 'a', password: 'a', confirmPassword: 'a' });
    render(<RegisterPage />);
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
  });

  it('shows registration disabled alert and disables form', () => {
    setupHookState({ registrationDisabled: true });
    render(<RegisterPage />);
    expect(screen.getByText('Registration is disabled. A super user already exists. Please contact the administrator.')).toBeInTheDocument();
    expect(screen.getByLabelText('Full name')).toBeDisabled();
    expect(screen.getByLabelText('Email address')).toBeDisabled();
    expect(screen.getByLabelText('Password')).toBeDisabled();
    expect(screen.getByLabelText('Confirm password')).toBeDisabled();
    expect(screen.getByRole('button', { name: /create account/i })).toBeDisabled();
  });

  it('toggles password visibility', () => {
    const setShowPassword = jest.fn();
    const setShowConfirmPassword = jest.fn();
    setupHookState({ setShowPassword, setShowConfirmPassword });
    render(<RegisterPage />);
    const buttons = screen.getAllByRole('button', { name: '' });
    fireEvent.click(buttons[0]);
    expect(setShowPassword).toHaveBeenCalled();
    fireEvent.click(buttons[1]);
    expect(setShowConfirmPassword).toHaveBeenCalled();
  });

  it('has proper accessibility labels', () => {
    setupHookState();
    render(<RegisterPage />);
    expect(screen.getByLabelText('Full name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('has proper form structure', () => {
    setupHookState();
    render(<RegisterPage />);
    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();
    const nameInput = screen.getByLabelText('Full name');
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm password');
    expect(form).toContainElement(nameInput);
    expect(form).toContainElement(emailInput);
    expect(form).toContainElement(passwordInput);
    expect(form).toContainElement(confirmPasswordInput);
  });

  it('has password requirements text', () => {
    setupHookState();
    render(<RegisterPage />);
    expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument();
  });
}); 