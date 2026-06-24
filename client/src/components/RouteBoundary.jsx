import React from 'react';
export default class RouteBoundary extends React.Component {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  componentDidCatch(error) {
    console.error('Could not open page', error);
  }
  render() {
    return this.state.error ? (
      <div className="page-container">
        <div className="empty-state">
          <h2>This page needs a moment</h2>
          <p>Please reload to try again.</p>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      </div>
    ) : (
      this.props.children
    );
  }
}
