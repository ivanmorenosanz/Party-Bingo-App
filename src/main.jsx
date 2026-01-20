import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { WalletProvider } from './context/WalletContext'
import { GameProvider } from './context/GameContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <WalletProvider>
                    <GameProvider>
                        <App />
                    </GameProvider>
                </WalletProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>,
)
