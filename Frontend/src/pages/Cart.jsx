// src/pages/Cart.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { loginRequest } from '../AuthConfig';
import { useCart } from '../context/CartContext';
import { fetchProductoPorId } from '../api/apiService';
import ProductImage from '../components/ProductImage';
import { formatPrice } from '../utils/format';

export default function Cart() {
    const isAuthenticated = useIsAuthenticated();
    const { instance } = useMsal();
    const { items, total, loading, error, updateQuantity, removeItem, clearCart } = useCart();
    const [productos, setProductos] = useState({});

    useEffect(() => {
        const faltantes = items
            .map((it) => it.productoId)
            .filter((id) => !productos[id]);

        if (faltantes.length === 0) return;

        let activo = true;
        Promise.all(faltantes.map((id) => fetchProductoPorId(id).catch(() => null)))
            .then((resultados) => {
                if (!activo) return;
                setProductos((prev) => {
                    const next = { ...prev };
                    resultados.forEach((p, idx) => {
                        if (p) next[faltantes[idx]] = p;
                    });
                    return next;
                });
            });
        return () => {
            activo = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items]);

    const handleLogin = async () => {
        try {
            await instance.loginPopup(loginRequest);
        } catch (err) {
            console.error(err);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="page cart-page">
                <div className="empty-state">
                    <div className="empty-state-icon">🔒</div>
                    <h3>Inicia sesión para ver tu carrito</h3>
                    <p>Tu carrito se guarda asociado a tu cuenta.</p>
                    <button className="btn btn-primary" onClick={handleLogin}>Iniciar sesión</button>
                </div>
            </div>
        );
    }

    return (
        <div className="page cart-page">
            <h1>Tu carrito</h1>

            {loading && items.length === 0 && <p className="state-message">Cargando carrito…</p>}
            {error && <p className="state-message state-error">{error}</p>}

            {!loading && items.length === 0 && !error && (
                <div className="empty-state">
                    <div className="empty-state-icon">🛒</div>
                    <h3>Tu carrito está vacío</h3>
                    <p>Explora el catálogo y encuentra tu próximo dispositivo.</p>
                    <Link to="/" className="btn btn-primary">Ir al catálogo</Link>
                </div>
            )}

            {items.length > 0 && (
                <div className="cart-layout">
                    <div className="cart-items">
                        {items.map((item) => {
                            const producto = productos[item.productoId];
                            return (
                                <div className="cart-item" key={item.id}>
                                    <Link to={`/producto/${item.productoId}`} className="cart-item-media">
                                        <ProductImage src={producto?.imagenUrl} alt={producto?.nombre || 'Producto'} />
                                    </Link>
                                    <div className="cart-item-info">
                                        <Link to={`/producto/${item.productoId}`} className="cart-item-title">
                                            {producto?.nombre || `Producto #${item.productoId}`}
                                        </Link>
                                        <p className="cart-item-price">{formatPrice(item.precioUnitario)} c/u</p>
                                        <div className="quantity-control quantity-control-sm">
                                            <button onClick={() => updateQuantity(item.productoId, item.cantidad - 1)}>-</button>
                                            <span>{item.cantidad}</span>
                                            <button
                                                onClick={() => updateQuantity(item.productoId, item.cantidad + 1)}
                                                disabled={producto && item.cantidad >= producto.stock}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    <div className="cart-item-end">
                                        <span className="cart-item-subtotal">{formatPrice(item.subtotal)}</span>
                                        <button className="btn-link btn-remove" onClick={() => removeItem(item.productoId)}>
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        <button className="btn-link" onClick={clearCart}>Vaciar carrito</button>
                    </div>

                    <aside className="cart-summary">
                        <h3>Resumen del pedido</h3>
                        <div className="cart-summary-row">
                            <span>Subtotal</span>
                            <span>{formatPrice(total)}</span>
                        </div>
                        <div className="cart-summary-row cart-summary-total">
                            <span>Total</span>
                            <span>{formatPrice(total)}</span>
                        </div>
                        <button className="btn btn-primary btn-lg btn-block">Finalizar compra</button>
                    </aside>
                </div>
            )}
        </div>
    );
}
