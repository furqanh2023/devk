import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('renders without crashing while authentication initializes', () => {
  render(<MemoryRouter><App /></MemoryRouter>);
  expect(document.body).toBeInTheDocument();
});
