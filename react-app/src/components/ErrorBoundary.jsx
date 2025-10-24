import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console for dev
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] Caught error in child tree:', error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page-container">
          <div className="page-content">
            <div className="section" style={{maxWidth: 900}}>
              <h3 className="section-title"><i className="fas fa-bug"></i> Une erreur est survenue</h3>
              <p>Un problème empêche l'affichage de cette page. Voici le détail de l'erreur (mode développement):</p>
              <pre style={{whiteSpace:'pre-wrap', background:'#1a1a1a', color:'#fff', padding: '10px', borderRadius: 6}}>
{String(this.state.error)}
              </pre>
              {this.state.info && (
                <details style={{marginTop: 10}}>
                  <summary>Trace</summary>
                  <pre style={{whiteSpace:'pre-wrap'}}>{this.state.info.componentStack}</pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
