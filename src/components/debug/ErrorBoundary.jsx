import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
                    <h1 className="text-3xl font-bold text-red-500 mb-4">Something went wrong 😵</h1>
                    <pre className="bg-gray-100 p-4 rounded text-left overflow-auto max-w-full text-red-600 font-mono text-sm border border-red-200">
                        {this.state.error?.toString()}
                    </pre>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
                    >
                        Go Home
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
