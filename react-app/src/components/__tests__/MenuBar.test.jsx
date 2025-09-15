import { render, screen, fireEvent } from '@testing-library/react';
import MenuBar from '../MenuBar';

describe('MenuBar', () => {
  test('renders menu bar with help button', () => {
    const mockOnHelp = jest.fn();
    render(<MenuBar onHelp={mockOnHelp} />);
    
    expect(screen.getByText('Assistant Rédactionnel')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\?/ })).toBeInTheDocument();
  });

  test('calls onHelp when help button is clicked', () => {
    const mockOnHelp = jest.fn();
    render(<MenuBar onHelp={mockOnHelp} />);
    
    const helpButton = screen.getByRole('button', { name: /\?/ });
    fireEvent.click(helpButton);
    
    expect(mockOnHelp).toHaveBeenCalledTimes(1);
  });

  test('renders theme toggle button', () => {
    const mockOnHelp = jest.fn();
    render(<MenuBar onHelp={mockOnHelp} />);
    
    expect(screen.getByRole('button', { name: /Passer en mode jour/i })).toBeInTheDocument();
  });
});