import { render, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { Button } from '../button';

afterEach(cleanup);

describe('Button', () => {
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    const { getByRole } = render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    const { getByRole, container } = render(<Button loading>Loading</Button>);
    const button = getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(container.querySelector('svg.animate-spin')).not.toBeNull();
  });
});
