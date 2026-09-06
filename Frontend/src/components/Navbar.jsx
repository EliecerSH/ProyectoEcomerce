// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { loginRequest } from '../AuthConfig';
import { useCart } from '../context/CartContext';

export default function Navbar({ onSearch }) {
    const { instance, accounts } = useMsal();
    const isAuthenticated = useIsAuthenticated();
    const activeAccount = accounts[0];
    const { itemCount } = useCart();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogin = async () => {
        try {
            await instance.loginPopup(loginRequest);
        } catch (err) {
            console.error('Error al iniciar sesión:', err);
        }
    };

    const handleLogout = () => {
        instance.logoutPopup({ postLogoutRedirectUri: window.location.origin });
    };

    const handleSubmitSearch = (e) => {
        e.preventDefault();
        onSearch?.(query.trim());
        navigate('/');
        setMenuOpen(false);
    };

    return (
        <header className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="brand" onClick={() => setMenuOpen(false)}>
                    <span className="brand-mark">⚡</span>
                    <span className="brand-name">Nexus<span className="brand-accent">Tech</span></span>
                </Link>

                <form className="navbar-search" onSubmit={handleSubmitSearch}>
                    <input
                        type="text"
                        placeholder="Buscar notebooks, celulares, componentes…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button type="submit" aria-label="Buscar">🔍</button>
                </form>

                <button
                    className="navbar-burger"
                    aria-label="Abrir menú"
                    onClick={() => setMenuOpen((v) => !v)}
                >
                    ☰
                </button>

                <nav className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                    <Link to="/" onClick={() => setMenuOpen(false)}>Catálogo</Link>

                    {isAuthenticated && (
                        <Link to="/admin" onClick={() => setMenuOpen(false)}>Administrar</Link>
                    )}

                    <Link to="/carrito" className="navbar-cart" onClick={() => setMenuOpen(false)}>
                        🛒 Carrito
                        {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
                    </Link>

                    {isAuthenticated ? (
                        <div className="navbar-account">
                            <Link to="/cuenta" className="navbar-user" onClick={() => setMenuOpen(false)}>
                                <span className="avatar">{activeAccount?.name?.charAt(0) || 'U'}</span>
                                <span className="navbar-user-name">{activeAccount?.name?.split(' ')[0]}</span>
                            </Link>
                            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                                Salir
                            </button>
                        </div>
                    ) : (
                        <button className="btn btn-primary btn-sm" onClick={handleLogin}>
                            Iniciar sesión
                        </button>
                    )}
                </nav>
            </div>
        </header>
    );
}
