import { Component } from 'react';
import ErrorState from './ErrorState.jsx';

// Keeps a page that crashes, or whose code fails to download, from blanking the whole site.
// `resetKey` clears the error when the visitor moves to another page.
export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidUpdate({ resetKey }) {
    if (this.state.failed && resetKey !== this.props.resetKey) this.setState({ failed: false });
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="container-page py-10">
        <ErrorState message="This page could not be loaded. Please check your connection and try again." onRetry={() => window.location.reload()} />
      </div>
    );
  }
}
