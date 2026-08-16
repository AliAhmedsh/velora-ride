export function getRideErrorMessage(error: unknown): string {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message: unknown }).message)
        : 'Could not book ride. Try again.';

  const lower = raw.toLowerCase();

  if (lower.includes('column') && lower.includes('does not exist')) {
    return 'Database setup incomplete. Run supabase/SETUP_DATABASE.sql in Supabase SQL Editor, then try again.';
  }

  if (lower.includes('could not find the table') || lower.includes('schema cache')) {
    return (
      'Rides table is missing in Supabase. Open Dashboard → SQL Editor → run the file supabase/SETUP_DATABASE.sql, then try again.'
    );
  }

  if (lower.includes('row-level security') || lower.includes('violates row-level security')) {
    return 'Booking blocked by database permissions. Check Supabase RLS policies for the rides table.';
  }

  if (lower.includes('not authenticated')) {
    return 'Please sign in again, then try booking.';
  }

  if (lower.includes('insufficient wallet')) {
    return 'Wallet balance is too low. Top up in Wallet or pay with cash.';
  }

  return raw;
}
