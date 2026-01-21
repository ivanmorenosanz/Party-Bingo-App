import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { WalletProvider } from './context/WalletContext'
import { GameProvider } from './context/GameContext'
import ErrorBoundary from './components/debug/ErrorBoundary'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <BrowserRouter>
                <AuthProvider>
                    <WalletProvider>
                        <GameProvider>
                            <App />
                        </GameProvider>
                    </WalletProvider>
                </AuthProvider>
            </BrowserRouter>
        </ErrorBoundary>
    </React.StrictMode>,
)
