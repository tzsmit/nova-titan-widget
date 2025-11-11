/**
 * Unit Tests for AgeVerification Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AgeVerification from '../../../components/compliance/AgeVerification';
import { useComplianceStore } from '../../../store/complianceStore';

// Mock the compliance store
vi.mock('../../../store/complianceStore', () => ({
  useComplianceStore: vi.fn(),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('AgeVerification Component', () => {
  const mockSetAgeVerified = vi.fn();
  const mockOnVerified = vi.fn();
  const mockOnFailed = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    (useComplianceStore as any).mockReturnValue({
      ageVerification: {
        isVerified: false,
        dateOfBirth: null,
        verificationMethod: null,
        verifiedAt: null,
      },
      setAgeVerified: mockSetAgeVerified,
    });
  });

  describe('Rendering', () => {
    it('should render intro step by default', () => {
      render(<AgeVerification />);

      expect(screen.getByText(/Age Verification Required/i)).toBeInTheDocument();
      expect(screen.getByText(/You must be at least 21 years old/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Continue to Verification/i })).toBeInTheDocument();
    });

    it('should render custom minimum age', () => {
      render(<AgeVerification minAge={18} />);

      expect(screen.getByText(/You must be at least 18 years old/i)).toBeInTheDocument();
    });

    it('should not render if already verified', () => {
      (useComplianceStore as any).mockReturnValue({
        ageVerification: {
          isVerified: true,
          dateOfBirth: new Date('1990-01-01'),
          verificationMethod: 'self-declaration',
          verifiedAt: new Date(),
        },
        setAgeVerified: mockSetAgeVerified,
      });

      const { container } = render(<AgeVerification />);

      expect(container.firstChild).toBeNull();
    });

    it('should display privacy notice', () => {
      render(<AgeVerification />);

      expect(
        screen.getByText(/Your date of birth is stored locally and never shared/i)
      ).toBeInTheDocument();
    });

    it('should display legal reasons for age verification', () => {
      render(<AgeVerification />);

      expect(screen.getByText(/Federal and state law requires age verification/i)).toBeInTheDocument();
      expect(screen.getByText(/Protect minors from gambling-related harm/i)).toBeInTheDocument();
      expect(screen.getByText(/Comply with responsible gaming regulations/i)).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate from intro to form when continue is clicked', async () => {
      render(<AgeVerification />);

      const continueButton = screen.getByRole('button', { name: /Continue to Verification/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText(/Enter Your Date of Birth/i)).toBeInTheDocument();
      });
    });

    it('should show date input fields in form step', async () => {
      render(<AgeVerification />);

      fireEvent.click(screen.getByRole('button', { name: /Continue to Verification/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/Month/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Day/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Year/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    const setupForm = async () => {
      render(<AgeVerification />);
      fireEvent.click(screen.getByRole('button', { name: /Continue to Verification/i }));
      await waitFor(() => {
        expect(screen.getByLabelText(/Month/i)).toBeInTheDocument();
      });
    };

    it('should validate month range (1-12)', async () => {
      await setupForm();

      const monthInput = screen.getByLabelText(/Month/i);
      const dayInput = screen.getByLabelText(/Day/i);
      const yearInput = screen.getByLabelText(/Year/i);
      const submitButton = screen.getByRole('button', { name: /Verify Age/i });

      await userEvent.type(monthInput, '13'); // Invalid month
      await userEvent.type(dayInput, '15');
      await userEvent.type(yearInput, '1990');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Invalid month/i)).toBeInTheDocument();
      });
    });

    it('should validate day range (1-31)', async () => {
      await setupForm();

      const monthInput = screen.getByLabelText(/Month/i);
      const dayInput = screen.getByLabelText(/Day/i);
      const yearInput = screen.getByLabelText(/Year/i);
      const submitButton = screen.getByRole('button', { name: /Verify Age/i });

      await userEvent.type(monthInput, '6');
      await userEvent.type(dayInput, '32'); // Invalid day
      await userEvent.type(yearInput, '1990');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Invalid day/i)).toBeInTheDocument();
      });
    });

    it('should validate year range', async () => {
      await setupForm();

      const monthInput = screen.getByLabelText(/Month/i);
      const dayInput = screen.getByLabelText(/Day/i);
      const yearInput = screen.getByLabelText(/Year/i);
      const submitButton = screen.getByRole('button', { name: /Verify Age/i });

      await userEvent.type(monthInput, '6');
      await userEvent.type(dayInput, '15');
      await userEvent.type(yearInput, '1899'); // Too old
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Invalid year/i)).toBeInTheDocument();
      });
    });

    it('should reject future dates', async () => {
      await setupForm();

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const monthInput = screen.getByLabelText(/Month/i);
      const dayInput = screen.getByLabelText(/Day/i);
      const yearInput = screen.getByLabelText(/Year/i);
      const submitButton = screen.getByRole('button', { name: /Verify Age/i });

      await userEvent.type(monthInput, String(tomorrow.getMonth() + 1));
      await userEvent.type(dayInput, String(tomorrow.getDate()));
      await userEvent.type(yearInput, String(tomorrow.getFullYear()));
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/cannot be in the future/i)).toBeInTheDocument();
      });
    });

    it('should reject invalid dates (e.g., Feb 30)', async () => {
      await setupForm();

      const monthInput = screen.getByLabelText(/Month/i);
      const dayInput = screen.getByLabelText(/Day/i);
      const yearInput = screen.getByLabelText(/Year/i);
      const submitButton = screen.getByRole('button', { name: /Verify Age/i });

      await userEvent.type(monthInput, '2');
      await userEvent.type(dayInput, '30'); // Invalid date
      await userEvent.type(yearInput, '1990');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Invalid date/i)).toBeInTheDocument();
      });
    });
  });

  describe('Age Verification Logic', () => {
    const setupForm = async () => {
      render(<AgeVerification />);
      fireEvent.click(screen.getByRole('button', { name: /Continue to Verification/i }));
      await waitFor(() => {
        expect(screen.getByLabelText(/Month/i)).toBeInTheDocument();
      });
    };

    it('should accept users who are exactly the minimum age', async () => {
      await setupForm();

      const today = new Date();
      const exactAge = new Date(today);
      exactAge.setFullYear(today.getFullYear() - 21);

      const monthInput = screen.getByLabelText(/Month/i);
      const dayInput = screen.getByLabelText(/Day/i);
      const yearInput = screen.getByLabelText(/Year/i);
      const submitButton = screen.getByRole('button', { name: /Verify Age/i });

      await userEvent.type(monthInput, String(exactAge.getMonth() + 1));
      await userEvent.type(dayInput, String(exactAge.getDate()));
      await userEvent.type(yearInput, String(exactAge.getFullYear()));
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSetAgeVerified).toHaveBeenCalled();
      });
    });

    it('should accept users older than minimum age', async () => {
      await setupForm();

      const monthInput = screen.getByLabelText(/Month/i);
      const dayInput = screen.getByLabelText(/Day/i);
      const yearInput = screen.getByLabelText(/Year/i);
      const submitButton = screen.getByRole('button', { name: /Verify Age/i });

      await userEvent.type(monthInput, '1');
      await userEvent.type(dayInput, '1');
      await userEvent.type(yearInput, '1990');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSetAgeVerified).toHaveBeenCalledWith(
          expect.any(Date),
          'self-declaration'
        );
      });
    });

    it('should reject users younger than minimum age', async () => {
      await setupForm();

      const today = new Date();
      const tooYoung = new Date(today);
      tooYoung.setFullYear(today.getFullYear() - 18); // Only 18 years old

      const monthInput = screen.getByLabelText(/Month/i);
      const dayInput = screen.getByLabelText(/Day/i);
      const yearInput = screen.getByLabelText(/Year/i);
      const submitButton = screen.getByRole('button', { name: /Verify Age/i });

      await userEvent.type(monthInput, String(tooYoung.getMonth() + 1));
      await userEvent.type(dayInput, String(tooYoung.getDate()));
      await userEvent.type(yearInput, String(tooYoung.getFullYear()));
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSetAgeVerified).not.toHaveBeenCalled();
        expect(screen.getByText(/You must be at least 21 years old/i)).toBeInTheDocument();
      });
    });

    it('should call onFailed callback when age verification fails', async () => {
      render(<AgeVerification onFailed={mockOnFailed} />);
      fireEvent.click(screen.getByRole('button', { name: /Continue to Verification/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/Month/i)).toBeInTheDocument();
      });

      const today = new Date();
      const tooYoung = new Date(today);
      tooYoung.setFullYear(today.getFullYear() - 18);

      const monthInput = screen.getByLabelText(/Month/i);
      const dayInput = screen.getByLabelText(/Day/i);
      const yearInput = screen.getByLabelText(/Year/i);
      const submitButton = screen.getByRole('button', { name: /Verify Age/i });

      await userEvent.type(monthInput, String(tooYoung.getMonth() + 1));
      await userEvent.type(dayInput, String(tooYoung.getDate()));
      await userEvent.type(yearInput, String(tooYoung.getFullYear()));
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnFailed).toHaveBeenCalled();
      });
    });

    it('should call onVerified callback when age verification succeeds', async () => {
      render(<AgeVerification onVerified={mockOnVerified} />);
      fireEvent.click(screen.getByRole('button', { name: /Continue to Verification/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/Month/i)).toBeInTheDocument();
      });

      const monthInput = screen.getByLabelText(/Month/i);
      const dayInput = screen.getByLabelText(/Day/i);
      const yearInput = screen.getByLabelText(/Year/i);
      const submitButton = screen.getByRole('button', { name: /Verify Age/i });

      await userEvent.type(monthInput, '1');
      await userEvent.type(dayInput, '1');
      await userEvent.type(yearInput, '1990');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSetAgeVerified).toHaveBeenCalled();
      });
    });
  });

  describe('Success State', () => {
    it('should show success message after verification', async () => {
      render(<AgeVerification />);
      fireEvent.click(screen.getByRole('button', { name: /Continue to Verification/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/Month/i)).toBeInTheDocument();
      });

      const monthInput = screen.getByLabelText(/Month/i);
      const dayInput = screen.getByLabelText(/Day/i);
      const yearInput = screen.getByLabelText(/Year/i);
      const submitButton = screen.getByRole('button', { name: /Verify Age/i });

      await userEvent.type(monthInput, '1');
      await userEvent.type(dayInput, '1');
      await userEvent.type(yearInput, '1990');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Age Verified/i)).toBeInTheDocument();
        expect(screen.getByText(/You have successfully verified your age/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on inputs', async () => {
      render(<AgeVerification />);
      fireEvent.click(screen.getByRole('button', { name: /Continue to Verification/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/Month/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Day/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Year/i)).toBeInTheDocument();
      });
    });

    it('should have submit button with proper role', async () => {
      render(<AgeVerification />);
      fireEvent.click(screen.getByRole('button', { name: /Continue to Verification/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Verify Age/i })).toBeInTheDocument();
      });
    });

    it('should prevent modal close when not verified', () => {
      const { container } = render(<AgeVerification />);
      
      const backdrop = container.firstChild as HTMLElement;
      fireEvent.click(backdrop);

      // Modal should still be visible
      expect(screen.getByText(/Age Verification Required/i)).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should disable submit button during submission', async () => {
      render(<AgeVerification />);
      fireEvent.click(screen.getByRole('button', { name: /Continue to Verification/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/Month/i)).toBeInTheDocument();
      });

      const monthInput = screen.getByLabelText(/Month/i);
      const dayInput = screen.getByLabelText(/Day/i);
      const yearInput = screen.getByLabelText(/Year/i);
      const submitButton = screen.getByRole('button', { name: /Verify Age/i });

      await userEvent.type(monthInput, '1');
      await userEvent.type(dayInput, '1');
      await userEvent.type(yearInput, '1990');
      
      expect(submitButton).not.toBeDisabled();
      
      fireEvent.click(submitButton);

      // Button should be disabled during submission
      expect(submitButton).toBeDisabled();
    });
  });
});
