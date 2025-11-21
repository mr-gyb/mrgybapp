import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CommunityAvatar from '../../components/community/CommunityAvatar';
import { getInitials } from '../avatar';

describe('getInitials', () => {
  it('returns initials from a display name', () => {
    expect(getInitials('Jane Doe')).toBe('JD');
  });

  it('returns first and last initials for multi word names', () => {
    expect(getInitials('Mary Ann Doe')).toBe('MD');
  });

  it('derives initials from email when display name missing', () => {
    expect(getInitials('someone.special@example.com')).toBe('SS');
    expect(getInitials('solo@example.com')).toBe('SO');
  });

  it('falls back to U when no data provided', () => {
    expect(getInitials('')).toBe('U');
    expect(getInitials(undefined)).toBe('U');
  });
});

describe('CommunityAvatar', () => {
  it('renders initials when image fails to load', () => {
    render(
      <CommunityAvatar
        name="Jane Smith"
        photoURL="https://example.com/avatar.png"
        data-testid="community-avatar"
      />
    );

    const image = screen.getByRole('img');
    fireEvent.error(image);

    expect(screen.getByText('JS')).toBeInTheDocument();
  });

  it('renders initials immediately when URL is invalid', () => {
    render(<CommunityAvatar email="someone@example.com" photoURL="invalid-url" />);
    expect(screen.getByText('SE')).toBeInTheDocument();
  });
});

