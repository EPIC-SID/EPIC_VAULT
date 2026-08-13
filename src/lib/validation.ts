/**
 * Validation & User-Friendly Error Formatting Utility
 */

/**
 * Validates an email address format
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  const trimmed = email.trim()
  if (!trimmed) {
    return { isValid: false, error: 'Please enter your email address.' }
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address (e.g. name@example.com).' }
  }
  return { isValid: true }
}

/**
 * Validates a mobile / phone number (10-digit standard format with optional country code)
 */
export function validateMobile(phone: string): { isValid: boolean; cleaned: string; error?: string } {
  const trimmed = phone.trim()
  if (!trimmed) {
    return { isValid: false, cleaned: '', error: 'Please enter your mobile number.' }
  }

  // Remove common separators (+91, spaces, hyphens, parentheses)
  const digitsOnly = trimmed.replace(/[\s\-\(\)\+]/g, '')

  // Allow standard 10 digit or 12 digit (with 91 prefix)
  let standard10 = digitsOnly
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    standard10 = digitsOnly.slice(2)
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    standard10 = digitsOnly.slice(1)
  }

  // Check 10 digit standard phone
  const phone10Regex = /^[6-9]\d{9}$/
  if (!phone10Regex.test(standard10)) {
    return {
      isValid: false,
      cleaned: digitsOnly,
      error: 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9 (e.g. 9876543210).'
    }
  }

  return { isValid: true, cleaned: standard10 }
}

/**
 * Translates technical error messages (Supabase, Brevo, Network) into friendly human messages
 */
export function formatUserFriendlyError(err: unknown): string {
  if (!err) return 'An unexpected error occurred. Please try again.'

  const message = typeof err === 'string' 
    ? err 
    : err instanceof Error 
      ? err.message 
      : (err as any)?.error_description || (err as any)?.message || JSON.stringify(err)

  const lower = message.toLowerCase()

  // Authentication errors
  if (lower.includes('invalid login credentials') || lower.includes('invalid grant')) {
    return 'Incorrect email or password. Please double-check your credentials and try again.'
  }
  if (lower.includes('user already registered') || lower.includes('already exists')) {
    return 'An account with this email already exists. Please sign in or use a different email.'
  }
  if (lower.includes('email not confirmed')) {
    return 'Your email has not been verified yet. Please check your inbox for the confirmation email.'
  }
  if (lower.includes('token is expired') || lower.includes('token has expired') || lower.includes('otp expired') || lower.includes('invalid token')) {
    return 'The OTP passcode has expired or is invalid. Please request a fresh 6-digit code.'
  }
  if (lower.includes('rate limit') || lower.includes('too many requests') || lower.includes('over_email_send_rate_limit')) {
    return 'You have made too many attempts recently. Please wait a minute before trying again.'
  }
  if (lower.includes('password should be at least') || lower.includes('password is too short')) {
    return 'For security, your password must be at least 6 characters long.'
  }

  // Network & Server errors
  if (lower.includes('failed to fetch') || lower.includes('networkerror') || lower.includes('offline') || lower.includes('timeout')) {
    return 'Network connection issue. Please check your internet connection and try again.'
  }
  if (lower.includes('jwt expired') || lower.includes('session expired')) {
    return 'Your login session has expired. Please sign in again to continue.'
  }

  // Stock / Order errors
  if (lower.includes('insufficient stock') || lower.includes('stock')) {
    return 'One or more items in your cart exceed available stock. Please reduce the quantity.'
  }
  if (lower.includes('not found') || lower.includes('404')) {
    return 'The requested resource was not found. It may have been moved or deleted.'
  }

  return message
}
