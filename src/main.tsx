import React, {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

type BoundaryState = { hasError: boolean; message: string };

class RootErrorBoundary extends React.Component<React.PropsWithChildren, BoundaryState> {
  state: BoundaryState = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown): BoundaryState {
    const message = error instanceof Error ? error.message : 'Erro desconhecido ao renderizar a aplicação.';
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown) {
    console.error('Erro fatal de renderização:', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{ minHeight: '100vh', background: '#111', color: '#fff', display: 'grid', placeItems: 'center', padding: '24px' }}>
        <div style={{ maxWidth: '760px', width: '100%', background: '#1b1b1b', border: '1px solid #333', borderRadius: '12px', padding: '20px' }}>
          <h1 style={{ marginBottom: '8px', fontSize: '20px' }}>Erro ao abrir o app</h1>
          <p style={{ opacity: 0.85, marginBottom: '12px' }}>
            A aplicação falhou ao iniciar. Copie esta mensagem e me envie:
          </p>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: '#121212', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '12px' }}>
            {this.state.message}
          </pre>
        </div>
      </div>
    );
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Elemento #root não encontrado no index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
);
