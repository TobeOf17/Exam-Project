import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../page';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  redirect: jest.fn(),
}));

describe('Home page', () => {
  it('should render the main heading', () => {
    render(<Home />);
    const heading = screen.getByRole('heading', {
      name: /welcome to the point of sale system/i,
    });
    expect(heading).toBeInTheDocument();
  });
});