import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../components/Home';
import axios from 'axios';
import authService from '../services/auth.service';
import favoriteService from '../services/favorite.service';

jest.mock('axios');
jest.mock('../services/auth.service', () => ({
  getCurrentUser: jest.fn().mockReturnValue(null)
}));
jest.mock('../services/favorite.service', () => ({
  getFavorites: jest.fn(),
  toggleFavorite: jest.fn()
}));

const renderWithRouter = (ui) =>
  render(<BrowserRouter>{ui}</BrowserRouter>);

describe('Home Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({
      data: [
        {
          name: { common: 'United States' },
          population: 331002651,
          region: 'Americas',
          capital: ['Washington, D.C.'],
          flags: { png: 'us-flag.png' },
          cca3: 'USA'
        },
        {
          name: { common: 'Canada' },
          population: 37742154,
          region: 'Americas',
          capital: ['Ottawa'],
          flags: { png: 'canada-flag.png' },
          cca3: 'CAN'
        }
      ]
    });
  });

  test('renders search input, region filter, and country cards', async () => {
    renderWithRouter(<Home />);
    expect(screen.getByPlaceholderText(/search for a country/i)).toBeInTheDocument();
    expect(screen.getByText(/filter by region/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument();
      expect(screen.getByText('Canada')).toBeInTheDocument();
    });
  });

  test('shows skeleton loaders while fetching countries', () => {
    axios.get.mockImplementationOnce(() =>
      new Promise((resolve) =>
        setTimeout(() => resolve({ data: [] }), 100)
      )
    );
    renderWithRouter(<Home />);
    const loaders = document.querySelectorAll('.animate-pulse');
    expect(loaders.length).toBeGreaterThan(0);
  });

  test('searches and displays filtered countries', async () => {
    renderWithRouter(<Home />);
    await waitFor(() => screen.getByText('United States'));

    axios.get.mockResolvedValueOnce({
      data: [
        {
          name: { common: 'Canada' },
          population: 37742154,
          region: 'Americas',
          capital: ['Ottawa'],
          flags: { png: 'canada-flag.png' },
          cca3: 'CAN'
        }
      ]
    });

    const input = screen.getByPlaceholderText(/search for a country/i);
    fireEvent.change(input, { target: { value: 'Canada' } });
    fireEvent.submit(input.closest('form'));

    await waitFor(() => {
      expect(screen.getByText('Canada')).toBeInTheDocument();
      expect(screen.queryByText('United States')).not.toBeInTheDocument();
    });
  });

  test('filters countries by region', async () => {
    renderWithRouter(<Home />);
    await waitFor(() => screen.getByText('United States'));

    axios.get.mockResolvedValueOnce({
      data: [
        {
          name: { common: 'Germany' },
          population: 83240525,
          region: 'Europe',
          capital: ['Berlin'],
          flags: { png: 'germany-flag.png' },
          cca3: 'DEU'
        }
      ]
    });

    fireEvent.click(screen.getByText(/filter by region/i));
    fireEvent.click(screen.getByText('Europe'));

    await waitFor(() => {
      expect(screen.getByText('Germany')).toBeInTheDocument();
      expect(screen.queryByText('United States')).not.toBeInTheDocument();
    });
  });

  test('sorts countries by population and name', async () => {
    renderWithRouter(<Home />);
    await waitFor(() => screen.getByText('United States'));

    // Test population sort (high to low)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'population-high' } });

    // Get all country name headings
    await waitFor(() => {
      const countryHeadings = screen.getAllByRole('heading', { level: 2 });
      // US population > Canada population, so US should be first
      expect(countryHeadings[0].textContent).toBe('United States');
      expect(countryHeadings[1].textContent).toBe('Canada');
    });

    // Test name sort (alphabetical)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'name' } });

    await waitFor(() => {
      const sortedHeadings = screen.getAllByRole('heading', { level: 2 });
      // Canada comes before United States alphabetically
      expect(sortedHeadings[0].textContent).toBe('Canada');
      expect(sortedHeadings[1].textContent).toBe('United States');
    });
  });
});
