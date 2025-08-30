// Client-side email verification utilities
// This file is safe to import in browser components

export function checkEmailVerification(): boolean {
  // Check if user has verified email stored in localStorage
  if (typeof window === 'undefined') {
    return false; // Server-side rendering
  }
  
  const verified = localStorage.getItem('uf_email_verified');
  return verified === 'true';
}

export function setEmailVerified(verified: boolean): void {
  if (typeof window === 'undefined') {
    return; // Server-side rendering
  }
  
  localStorage.setItem('uf_email_verified', verified.toString());
}

export function getVerifiedEmail(): string | null {
  if (typeof window === 'undefined') {
    return null; // Server-side rendering
  }
  
  return localStorage.getItem('uf_verified_email');
}

export function setVerifiedEmail(email: string): void {
  if (typeof window === 'undefined') {
    return; // Server-side rendering
  }
  
  localStorage.setItem('uf_verified_email', email);
}

export function clearVerificationData(): void {
  if (typeof window === 'undefined') {
    return; // Server-side rendering
  }
  
  localStorage.removeItem('uf_email_verified');
  localStorage.removeItem('uf_verified_email');
}