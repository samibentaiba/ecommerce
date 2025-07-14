import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SettingsPage from '../page'
import { useSettings } from '../hook'

// Mock the hook
jest.mock('../hook')
const mockUseSettings = useSettings as jest.MockedFunction<typeof useSettings>

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

// Mock fetch
global.fetch = jest.fn()

const mockSettings = {
  // Store Settings
  storeName: "EcoStore",
  storeDescription: "Your trusted partner for quality products and exceptional service.",
  storeEmail: "contact@ecostore.com",
  storePhone: "+1 (555) 123-4567",
  storeAddress: "123 Commerce Street, Business City, BC 12345",

  // SEO Settings
  siteTitle: "EcoStore - Quality Products for Modern Life",
  siteDescription: "Discover amazing products with exceptional quality and service. Shop electronics, lifestyle products, and more.",
  siteKeywords: "ecommerce, electronics, lifestyle, quality products",

  // Email Settings
  emailNotifications: true,
  orderConfirmations: true,
  marketingEmails: false,
  smtpHost: "smtp.gmail.com",
  smtpPort: "587",
  smtpUsername: "",
  smtpPassword: "",

  // Payment Settings
  currency: "USD",
  taxRate: "8.5",
  shippingRate: "9.99",
  freeShippingThreshold: "50.00",

  // Theme Settings
  primaryColor: "#3b82f6",
  secondaryColor: "#64748b",
  accentColor: "#10b981",
  darkMode: false,

  // Security Settings
  twoFactorAuth: false,
  sessionTimeout: "30",
  passwordRequirements: true,

  // Analytics
  googleAnalyticsId: "",
  facebookPixelId: "",
  enableTracking: true,
}

const defaultMockHook = {
  settings: mockSettings,
  loading: false,
  saving: false,
  updateSetting: jest.fn(),
  updateSettings: jest.fn(),
  saveSettings: jest.fn(),
  resetSettings: jest.fn(),
  fetchSettings: jest.fn(),
}

describe('SettingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSettings.mockReturnValue(defaultMockHook)
  })

  describe('Loading State', () => {
    it('should show loading spinner when loading', () => {
      mockUseSettings.mockReturnValue({
        ...defaultMockHook,
        loading: true,
      })

      render(<SettingsPage />)
      
      expect(screen.getByText('Loading settings...')).toBeInTheDocument()
      // The loader icon has aria-hidden="true", so we can't query by role
      expect(screen.getByText('Loading settings...').closest('div')).toBeInTheDocument()
    })
  })

  describe('Page Structure', () => {
    it('should render the main heading and description', () => {
      render(<SettingsPage />)
      
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('Manage your store configuration and preferences')).toBeInTheDocument()
    })

    it('should render all tab triggers', () => {
      render(<SettingsPage />)
      
      expect(screen.getByText('Store')).toBeInTheDocument()
      expect(screen.getByText('SEO')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText((content) => content.includes('Payment'))).toBeInTheDocument()
      expect(screen.getByText('Theme')).toBeInTheDocument()
      expect(screen.getByText('Security')).toBeInTheDocument()
    })

    it('should show store tab by default', () => {
      render(<SettingsPage />)
      
      expect(screen.getByText('Store Information')).toBeInTheDocument()
      expect(screen.getByText('Basic information about your store')).toBeInTheDocument()
    })
  })

  describe('Store Settings Tab', () => {
    it('should render all store settings fields', () => {
      render(<SettingsPage />)
      
      expect(screen.getByLabelText('Store Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Store Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Store Description')).toBeInTheDocument()
      expect(screen.getByLabelText('Phone Number')).toBeInTheDocument()
      expect(screen.getByLabelText('Address')).toBeInTheDocument()
    })

    it('should display current store settings values', () => {
      render(<SettingsPage />)
      
      expect(screen.getByDisplayValue('EcoStore')).toBeInTheDocument()
      expect(screen.getByDisplayValue('contact@ecostore.com')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Your trusted partner for quality products and exceptional service.')).toBeInTheDocument()
      expect(screen.getByDisplayValue('+1 (555) 123-4567')).toBeInTheDocument()
      expect(screen.getByDisplayValue('123 Commerce Street, Business City, BC 12345')).toBeInTheDocument()
    })

    it('should call updateSetting when store name is changed', async () => {
      render(<SettingsPage />)
      const storeNameInput = screen.getByLabelText('Store Name')
      await act(async () => {
      fireEvent.change(storeNameInput, { target: { value: 'New Store Name' } })
      })
      expect(defaultMockHook.updateSetting).toHaveBeenCalledWith('storeName', 'New Store Name')
    })

    it('should call saveSettings when save button is clicked', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)
      const saveButton = screen.getByText('Save Store Settings')
      await act(async () => {
      await user.click(saveButton)
      })
      expect(defaultMockHook.saveSettings).toHaveBeenCalledWith('Store')
    })

    it('should disable save button when saving', () => {
      mockUseSettings.mockReturnValue({
        ...defaultMockHook,
        saving: true,
      })

      render(<SettingsPage />)
      
      const saveButton = screen.getByText('Save Store Settings')
      expect(saveButton).toBeDisabled()
    })
  })

  describe('SEO Settings Tab', () => {
    it('should render SEO settings when tab is clicked', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)
      const seoTab = screen.getByText('SEO')
      await act(async () => {
      await user.click(seoTab)
      })
      expect(screen.getByText('SEO Configuration')).toBeInTheDocument()
      expect(screen.getByText('Optimize your store for search engines')).toBeInTheDocument()
    })

    it('should render all SEO fields', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)
      await act(async () => {
      await user.click(screen.getByText('SEO'))
      })
      expect(screen.getByLabelText('Site Title')).toBeInTheDocument()
      expect(screen.getByLabelText('Meta Description')).toBeInTheDocument()
      expect(screen.getByLabelText('Keywords')).toBeInTheDocument()
      expect(screen.getByLabelText('Google Analytics ID')).toBeInTheDocument()
      expect(screen.getByLabelText('Facebook Pixel ID')).toBeInTheDocument()
      expect(screen.getByLabelText('Enable tracking and analytics')).toBeInTheDocument()
    })

    it('should call updateSetting when SEO fields are changed', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)
      
      await user.click(screen.getByText('SEO'))
      
      const siteTitleInput = screen.getByLabelText('Site Title')
      fireEvent.change(siteTitleInput, { target: { value: 'New Site Title' } })
      
      expect(defaultMockHook.updateSetting).toHaveBeenCalledWith('siteTitle', 'New Site Title')
    })

    it('should handle boolean toggle for tracking', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)
      
      await user.click(screen.getByText('SEO'))
      
      const trackingSwitch = screen.getByLabelText('Enable tracking and analytics')
      await user.click(trackingSwitch)
      
      expect(defaultMockHook.updateSetting).toHaveBeenCalledWith('enableTracking', false)
    })
  })

  describe('Email Settings Tab', () => {
    it('should render email settings when tab is clicked', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)
      
      await user.click(screen.getByText('Email'))
      
      expect(screen.getByText('Email Configuration')).toBeInTheDocument()
      expect(screen.getByText('Configure email notifications and SMTP settings')).toBeInTheDocument()
    })

    it('should render all email notification toggles', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)
      
      await user.click(screen.getByText('Email'))
      
      expect(screen.getByLabelText('Enable email notifications')).toBeInTheDocument()
      expect(screen.getByLabelText('Send order confirmations')).toBeInTheDocument()
      expect(screen.getByLabelText('Send marketing emails')).toBeInTheDocument()
    })

    it('should render all SMTP fields', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)
      
      await user.click(screen.getByText('Email'))
      
      expect(screen.getByLabelText('SMTP Host')).toBeInTheDocument()
      expect(screen.getByLabelText('SMTP Port')).toBeInTheDocument()
      expect(screen.getByLabelText('SMTP Username')).toBeInTheDocument()
      expect(screen.getByLabelText('SMTP Password')).toBeInTheDocument()
    })

    it('should handle email notification toggles', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)
      
      await user.click(screen.getByText('Email'))
      
      const emailNotificationsSwitch = screen.getByLabelText('Enable email notifications')
      await user.click(emailNotificationsSwitch)
      
      expect(defaultMockHook.updateSetting).toHaveBeenCalledWith('emailNotifications', false)
    })
  })

  describe('Payment Settings Tab', () => {
    it('should render payment settings when tab is clicked', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)
      
      await user.click(screen.getByText((content) => content.includes('Payment')))
      
      expect(screen.getByText('Payment & Shipping')).toBeInTheDocument()
      expect(screen.getByText('Configure payment processing and shipping options')).toBeInTheDocument()
    })

    it('should render currency selector', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)
      
      await user.click(screen.getByText((content) => content.includes('Payment')))
      
      expect(screen.getByText('USD - US Dollar')).toBeInTheDocument()
    })

    it('should render payment method cards', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)
      
      await user.click(screen.getByText((content) => content.includes('Payment')))
      
      expect(screen.getByText('Credit Cards')).toBeInTheDocument()
      expect(screen.getByText('PayPal')).toBeInTheDocument()
      // Use getAllByText to handle multiple elements with same text
      const applePayElements = screen.getAllByText('Apple Pay')
      expect(applePayElements.length).toBeGreaterThan(0)
      const googlePayElements = screen.getAllByText('Google Pay')
      expect(googlePayElements.length).toBeGreaterThan(0)
    })

    it('should call updateSetting when payment fields are changed', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)
      
      await user.click(screen.getByText((content) => content.includes('Payment')))
      
      const taxRateInput = screen.getByLabelText('Tax Rate (%)')
      fireEvent.change(taxRateInput, { target: { value: '10.5' } })
      
      expect(defaultMockHook.updateSetting).toHaveBeenCalledWith('taxRate', '10.5')
    })
  })

  describe('Theme Settings Tab', () => {
    it('should render theme settings when tab is clicked', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)
      
      await user.click(screen.getByText('Theme'))
      
      expect(screen.getByText('Theme Customization')).toBeInTheDocument()
      expect(screen.getByText('Customize the look and feel of your store')).toBeInTheDocument()
    })

    it('should render color pickers', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)
      
      await user.click(screen.getByText('Theme'))
      
      // Use getAllByDisplayValue and check that the color inputs exist
      const primaryColorInputs = screen.getAllByDisplayValue('#3b82f6')
      expect(primaryColorInputs.length).toBeGreaterThan(0)
      
      const secondaryColorInputs = screen.getAllByDisplayValue('#64748b')
      expect(secondaryColorInputs.length).toBeGreaterThan(0)
      
      const accentColorInputs = screen.getAllByDisplayValue('#10b981')
      expect(accentColorInputs.length).toBeGreaterThan(0)
    })

    it('should render dark mode toggle', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)
      
      await user.click(screen.getByText('Theme'))
      
      expect(screen.getByLabelText('Enable dark mode')).toBeInTheDocument()
    })

    it('should call updateSetting when color is changed', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)
      
      await user.click(screen.getByText('Theme'))
      
      // Get the text input (not the color picker) for primary color
      const primaryColorInputs = screen.getAllByDisplayValue('#3b82f6')
      const textInput = primaryColorInputs.find(input => input.getAttribute('type') !== 'color')
      expect(textInput).toBeDefined()
      
      if (textInput) {
        fireEvent.change(textInput, { target: { value: '#ff0000' } })
        
        expect(defaultMockHook.updateSetting).toHaveBeenCalledWith('primaryColor', '#ff0000')
      }
    })

    it('should handle dark mode toggle', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)
      
      await user.click(screen.getByText('Theme'))
      
      const darkModeSwitch = screen.getByLabelText('Enable dark mode')
      await user.click(darkModeSwitch)
      
      expect(defaultMockHook.updateSetting).toHaveBeenCalledWith('darkMode', true)
    })
  })

  describe('Security Settings Tab', () => {
    it('should render security settings when tab is clicked', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)
      
      await user.click(screen.getByText('Security'))
      
      expect(screen.getByText('Security Settings')).toBeInTheDocument()
      expect(screen.getByText('Configure security and authentication options')).toBeInTheDocument()
    })

    it('should render security toggles', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)
      
      await user.click(screen.getByText('Security'))
      
      expect(screen.getByLabelText('Enable two-factor authentication')).toBeInTheDocument()
      expect(screen.getByLabelText('Enforce strong password requirements')).toBeInTheDocument()
    })

    it('should render session timeout selector', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)
      
      await user.click(screen.getByText('Security'))
      
      expect(screen.getByText('30 minutes')).toBeInTheDocument()
    })

    it('should render security status cards', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)
      
      await user.click(screen.getByText('Security'))
      
      expect(screen.getByText('SSL Certificate')).toBeInTheDocument()
      expect(screen.getByText('Firewall Protection')).toBeInTheDocument()
    })

    it('should handle security toggle changes', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)
      
      await user.click(screen.getByText('Security'))
      
      const twoFactorSwitch = screen.getByLabelText('Enable two-factor authentication')
      await user.click(twoFactorSwitch)
      
      expect(defaultMockHook.updateSetting).toHaveBeenCalledWith('twoFactorAuth', true)
    })
  })

  describe('Tab Navigation', () => {
    it('should switch between tabs correctly', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)
      
      // Start on store tab
      expect(screen.getByText('Store Information')).toBeInTheDocument()
      
      // Switch to SEO tab
      await user.click(screen.getByText('SEO'))
      expect(screen.getByText('SEO Configuration')).toBeInTheDocument()
      
      // Switch to email tab
      await user.click(screen.getByText('Email'))
      expect(screen.getByText('Email Configuration')).toBeInTheDocument()
      
      // Switch to payment tab
      await user.click(screen.getByText((content) => content.includes('Payment')))
      expect(screen.getByText('Payment & Shipping')).toBeInTheDocument()
      
      // Switch to theme tab
      await user.click(screen.getByText('Theme'))
      expect(screen.getByText('Theme Customization')).toBeInTheDocument()
      
      // Switch to security tab
      await user.click(screen.getByText('Security'))
      expect(screen.getByText('Security Settings')).toBeInTheDocument()
    })
  })

  describe('Save Functionality', () => {
    it('should call saveSettings for each section', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)
      
      // Save store settings
      await user.click(screen.getByText('Save Store Settings'))
      expect(defaultMockHook.saveSettings).toHaveBeenCalledWith('Store')
      
      // Save SEO settings
      await user.click(screen.getByText('SEO'))
      await user.click(screen.getByText('Save SEO Settings'))
      expect(defaultMockHook.saveSettings).toHaveBeenCalledWith('SEO')
      
      // Save email settings
      await user.click(screen.getByText('Email'))
      await user.click(screen.getByText('Save Email Settings'))
      expect(defaultMockHook.saveSettings).toHaveBeenCalledWith('Email')
      
      // Save payment settings
      await user.click(screen.getByText((content) => content.includes('Payment')))
      await user.click(screen.getByText('Save Payment Settings'))
      expect(defaultMockHook.saveSettings).toHaveBeenCalledWith('Payment')
      
      // Save theme settings
      await user.click(screen.getByText('Theme'))
      await user.click(screen.getByText('Save Theme Settings'))
      expect(defaultMockHook.saveSettings).toHaveBeenCalledWith('Theme')
      
      // Save security settings
      await user.click(screen.getByText('Security'))
      await user.click(screen.getByText('Save Security Settings'))
      expect(defaultMockHook.saveSettings).toHaveBeenCalledWith('Security')
    })

    it('should show loading state on save buttons when saving', () => {
      mockUseSettings.mockReturnValue({
        ...defaultMockHook,
        saving: true,
      })

      render(<SettingsPage />)
      
      const saveButtons = screen.getAllByText(/Save .* Settings/)
      saveButtons.forEach(button => {
        expect(button).toBeDisabled()
      })
    })
  })

  describe('Form Interactions', () => {
    it('should handle text input changes', async () => {
      render(<SettingsPage />)
      
      const storeNameInput = screen.getByLabelText('Store Name')
      fireEvent.change(storeNameInput, { target: { value: 'New Store' } })
      
      expect(defaultMockHook.updateSetting).toHaveBeenCalledWith('storeName', 'New Store')
    })

    it('should handle textarea changes', async () => {
      render(<SettingsPage />)
      
      const descriptionInput = screen.getByLabelText('Store Description')
      fireEvent.change(descriptionInput, { target: { value: 'New description' } })
      
      expect(defaultMockHook.updateSetting).toHaveBeenCalledWith('storeDescription', 'New description')
    })

    it('should handle email input changes', async () => {
      render(<SettingsPage />)
      
      const emailInput = screen.getByLabelText('Store Email')
      fireEvent.change(emailInput, { target: { value: 'new@store.com' } })
      
      expect(defaultMockHook.updateSetting).toHaveBeenCalledWith('storeEmail', 'new@store.com')
    })

    it('should handle password input changes', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)
      
      await user.click(screen.getByText('Email'))
      
      const passwordInput = screen.getByLabelText('SMTP Password')
      fireEvent.change(passwordInput, { target: { value: 'newpassword' } })
      
      expect(defaultMockHook.updateSetting).toHaveBeenCalledWith('smtpPassword', 'newpassword')
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for all form elements', () => {
      render(<SettingsPage />)
      
      expect(screen.getByLabelText('Store Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Store Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Store Description')).toBeInTheDocument()
      expect(screen.getByLabelText('Phone Number')).toBeInTheDocument()
      expect(screen.getByLabelText('Address')).toBeInTheDocument()
    })

    it('should have proper ARIA attributes for switches', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)
      
      await user.click(screen.getByText('Email'))
      
      const emailNotificationsSwitch = screen.getByLabelText('Enable email notifications')
      expect(emailNotificationsSwitch).toHaveAttribute('role', 'switch')
    })
  })
}) 