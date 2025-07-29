import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminProfilePage from '../page';
import { SessionProvider } from 'next-auth/react';

jest.mock('next-auth/react', () => ({
  ...jest.requireActual('next-auth/react'),
  useSession: () => ({
    data: {
      user: {
        name: 'Test User',
        email: 'test@example.com',
        image: 'test-image.jpg',
      },
    },
    update: jest.fn(),
  }),
}));

global.fetch = jest.fn();

describe('AdminProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockImplementation((url, options) => {
      // Initial load (GET)
      if (!options || options.method === undefined) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ name: 'Test User', email: 'test@example.com', image: 'test-image.jpg' }),
        });
      }
      // Update (PUT)
      if (options.method === "PUT") {
        return Promise.resolve({
          ok: true,
          json: async () => ({ user: { name: 'Test User', email: 'test@example.com', image: 'test-image.jpg' } }),
        });
      }
      // Fallback
      return Promise.resolve({ ok: false, json: async () => ({}) });
    });
  });

  function renderWithSession() {
    return render(
      <SessionProvider session={{ user: {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'ADMIN',
        parentId: null,
        twoFactorEnabled: false,
        permissions: [],
      }, expires: '2099-12-31T23:59:59.999Z' }}>
        <AdminProfilePage />
      </SessionProvider>
    );
  }

  it('renders profile form with user data', async () => {
    renderWithSession();
    await waitFor(async () => {
      expect(await screen.findByDisplayValue('Test User')).toBeInTheDocument();
      expect(await screen.findByDisplayValue('test@example.com')).toBeInTheDocument();
    });
    // Avatar image or fallback
    await waitFor(() => {
      expect(
        screen.queryByTestId('avatar-image') || screen.getByTestId('avatar-fallback')
      ).toBeInTheDocument();
    });
  });

  it('shows error if image is too large', async () => {
    renderWithSession();
    const file = new File([new ArrayBuffer(6 * 1024 * 1024)], 'large.png', { type: 'image/png' });
    const input = screen.getByTestId('file-input');
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(async () => {
      expect(await screen.findByTestId('alert-error')).toHaveTextContent(/image size must be less than 5MB/i);
    });
  });

  it('shows error if new passwords do not match', async () => {
    renderWithSession();
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'abc123' } });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'different' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    await waitFor(async () => {
      expect(await screen.findByTestId('alert-error')).toHaveTextContent(/new passwords do not match/i);
    }, { timeout: 2000 });
  });

  it('submits form and shows success on valid update', async () => {
    renderWithSession();
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    // Wait for either success or error alert
    await waitFor(() => {
      const success = screen.queryByTestId('alert-success');
      const error = screen.queryByTestId('alert-error');
      if (!success && !error) throw new Error('No alert rendered yet');
      if (error) {
        // eslint-disable-next-line no-console
        console.log(document.body.innerHTML);
        throw new Error('Error alert is present: ' + error.textContent);
      }
      expect(success).toBeInTheDocument();
      expect(success).toHaveTextContent(/profile updated successfully/i);
    }, { timeout: 2000 });
  });

  it('shows error if API returns error', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) }) // load
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Failed to update profile' }) }); // update
    renderWithSession();
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    await waitFor(async () => {
      const alert = await screen.findByTestId('alert-error');
      expect(alert).toBeInTheDocument();
      expect([
        /failed to update profile/i,
        /an error occurred while updating your profile/i,
      ].some(rx => rx.test(alert.textContent || ""))).toBe(true);
    }, { timeout: 2000 });
  });

  it('shows error if fetch throws', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) }) // load
      .mockImplementationOnce(() => { throw new Error('Network error'); }); // update
    renderWithSession();
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    await waitFor(async () => {
      expect(await screen.findByTestId('alert-error')).toHaveTextContent(/an error occurred while updating your profile/i);
    }, { timeout: 2000 });
  });
}); 