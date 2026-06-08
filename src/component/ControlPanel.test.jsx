import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import ControlPanel from './ControlPanel';

describe('ControlPanel', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('records a mock command for the selected ground vehicle CID', async () => {
    render(<ControlPanel />);

    await userEvent.click(screen.getByRole('button', { name: '■' }));

    expect(global.fetch).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('CID001 stop 목업 명령 적용');
  });

  test('switches CID layout and records a mock drone command', async () => {
    render(<ControlPanel />);

    await userEvent.selectOptions(screen.getByRole('combobox'), 'CID002');
    await userEvent.click(screen.getByRole('button', { name: '⤴️' }));

    expect(global.fetch).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('CID002 ascend 목업 명령 적용');
  });
});
