import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import App from './App';
import { clearAuthSession } from './features/auth/authStorage';

vi.mock('./features/streaming/components/StreamingSmokeDashboard', () => ({
  StreamingSmokeDashboard: function MockStreamingSmokeDashboard() {
    return <div data-testid="streaming-smoke-dashboard">Streaming smoke</div>;
  },
}));

vi.mock('./features/streaming/components/LocalWebcamPublisher', () => ({
  LocalWebcamPublisher: function MockLocalWebcamPublisher() {
    return <div data-testid="local-webcam-publisher">Local webcam publisher</div>;
  },
}));

describe('App dashboard shell', () => {
  beforeEach(() => {
    clearAuthSession();
  });

  afterEach(() => {
    clearAuthSession();
    window.history.pushState({}, '', '/');
  });

  test('renders the core dashboard regions', async () => {
    render(<App />);

    expect(await screen.findByRole('main', { name: 'Field Ops Dashboard MVP' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '자산트리' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '지도' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '선택 스트림' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '서버상태 / 연결상태 / 헬스체크' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '지오메트리 / 텔레메트리' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'AI 결과' })).toBeInTheDocument();
  });

  test('renders the streaming smoke dashboard when requested by query string', async () => {
    window.history.pushState({}, '', '/?streamingSmoke=1');

    render(<App />);

    expect(await screen.findByTestId('streaming-smoke-dashboard')).toBeInTheDocument();
    expect(screen.queryByTestId('hls-player')).not.toBeInTheDocument();
  });

  test('renders the local webcam publisher when requested by query string', async () => {
    window.history.pushState({}, '', '/?webcamPublisher=1');

    render(<App />);

    expect(await screen.findByTestId('local-webcam-publisher')).toBeInTheDocument();
  });

  test('renders the local webcam publisher on the protected publisher route', () => {
    window.history.pushState({}, '', '/publisher');

    render(<App />);

    expect(screen.getByTestId('local-webcam-publisher')).toBeInTheDocument();
  });

  test('renders the local webcam publisher route without server authentication', async () => {
    window.history.pushState({}, '', '/publisher');

    render(<App />);

    expect(await screen.findByTestId('local-webcam-publisher')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/publisher');
  });

  test('renders the dashboard without a stored server session', async () => {
    render(<App />);

    expect(await screen.findByRole('main', { name: 'Field Ops Dashboard MVP' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/');
  });

  test('renders streaming smoke query without server authentication', async () => {
    window.history.pushState({}, '', '/?streamingSmoke=1');

    render(<App />);

    expect(await screen.findByTestId('streaming-smoke-dashboard')).toBeInTheDocument();
    expect(window.location.search).toContain('streamingSmoke=1');
  });
});
