// ErrorBoundary.jsx — captura errores de render para que un fallo en una pantalla
// no deje la app en blanco. Muestra un mensaje amable + botón para recargar.
import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary capturó:', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ padding: '60px 28px', textAlign: 'center', fontFamily: 'var(--sans)' }}>
        <h2 style={{ margin: '0 0 8px', fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--ink)' }}>
          Algo salió mal
        </h2>
        <p style={{ margin: '0 0 20px', color: 'var(--ink-60)', fontSize: 14.5, lineHeight: 1.5 }}>
          Ocurrió un error inesperado. Recarga la app para continuar; tus datos están a salvo.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            border: 'none', background: 'var(--blue)', color: '#fff', borderRadius: 14,
            padding: '13px 22px', fontFamily: 'var(--sans)', fontSize: 15.5, fontWeight: 600, cursor: 'pointer',
          }}>
          Recargar
        </button>
      </div>
    );
  }
}
