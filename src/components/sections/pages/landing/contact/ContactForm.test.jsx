import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactForm from './ContactForm';

describe('ContactForm', () => {
  it('renders all form fields', () => {
    render(<ContactForm />);

    expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Phone')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Company')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Message')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('shows validation errors for required fields', async () => {
    render(<ContactForm />);

    const submitButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('First name is required.')).toBeInTheDocument();
      expect(screen.getByText('Last name is required.')).toBeInTheDocument();
      expect(screen.getByText('Email is required.')).toBeInTheDocument();
      expect(screen.getByText('Phone number is required.')).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    render(<ContactForm />);

    const emailInput = screen.getByPlaceholderText('Email');
    const submitButton = screen.getByRole('button', { name: /send message/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email must be a valid email.')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    render(<ContactForm />);

    // Fill out form
    fireEvent.change(screen.getByPlaceholderText('First Name'), {
      target: { value: 'John' }
    });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), {
      target: { value: 'Doe' }
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'john@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Phone'), {
      target: { value: '555-1234' }
    });
    fireEvent.change(screen.getByPlaceholderText('Company'), {
      target: { value: 'Acme Corp' }
    });
    fireEvent.change(screen.getByPlaceholderText('Message'), {
      target: { value: 'Test message' }
    });

    // Accept privacy policy
    const policySwitch = screen.getByRole('checkbox');
    fireEvent.click(policySwitch);

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-1234',
        company: 'Acme Corp',
        purpose: 'Test message',
        policyChecked: true,
      });
    });

    consoleSpy.mockRestore();
  });

  it('shows error when privacy policy not accepted', async () => {
    render(<ContactForm />);

    // Fill out all fields but don't check policy
    fireEvent.change(screen.getByPlaceholderText('First Name'), {
      target: { value: 'John' }
    });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), {
      target: { value: 'Doe' }
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'john@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Phone'), {
      target: { value: '555-1234' }
    });
    fireEvent.change(screen.getByPlaceholderText('Company'), {
      target: { value: 'Acme Corp' }
    });
    fireEvent.change(screen.getByPlaceholderText('Message'), {
      target: { value: 'Test message' }
    });

    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getByText('You must accept the privacy policy.')).toBeInTheDocument();
    });
  });
});
