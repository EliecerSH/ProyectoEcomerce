// src/pages/ProductDetail.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { loginRequest } from '../AuthConfig';
import { fetchProductoPorId } from '../api/apiService';
import { useCart } from '../context/CartContext';
import ProductImage from '../components/ProductImage';
import { formatPrice } from '../utils/format';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [producto, setProducto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cantidad, setCantidad] = useState(1);
    const [feedback, setFeedback] = useState(null);
    const [adding, setAdding] = useState(false);

    const { addItem } = useCart();
    const isAuthenticated = useIsAuthenticated();
    const { instance } = useMsal();

    useEffect(() => {
        let activo = true;
        setLoading(true);
        setError(null);
        fetchProductoPorId(id)
            .then((data) => activo && setProducto(data))
            .catch((err) => activo && setError(err.message))
            .finally(() => activo && setLoading(false));
        return () => {
            activo = false;
        };
    }, [id]);

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            try {
                await instance.loginPopup(loginRequest);
            } catch (err) {
                console.error(err);
            }
            return;
        }
        setAdding(true);
        const result = await addItem(producto.id, cantidad);
        setAdding(false);
        setFeedback(
            result.ok
                ? { type: 'success', text: 'Producto agregado al carrito.' }
                : { type: 'error', text: result.message || 'No se pudo agregar el producto.' }
        );
    };

    if (loading) return <div className="page state-message">Cargando producto…</div>;
    if (error) return <div className="page state-message state-error">{error}</div>;
    if (!producto) return null;

    const sinStock = !producto.stock || producto.stock <= 0;

    return (
        <div className="page product-detail-page">
            <button className="btn-link back-link" onClick={() => navigate(-1)}>← Volver</button>

            <div className="product-detail">
                <div className="product-detail-media">
                    <ProductImage src={producto.imagenUrl} alt={producto.nombre} />
                </div>

                <div className="product-detail-info">
                    {producto.categoria && <span className="badge badge-category">{producto.categoria}</span>}
                    <h1>{producto.nombre}</h1>
                    <p className="product-detail-price">{formatPrice(producto.precio)}</p>
                    <p className="product-detail-desc">{producto.descripcion || 'Sin descripción disponible.'}</p>

                    <p className={`stock-indicator ${sinStock ? 'stock-out' : 'stock-in'}`}>
                        {sinStock ? 'Sin stock disponible' : `${producto.stock} unidades disponibles`}
                    </p>

                    {feedback && <div className={`alert alert-${feedback.type}`}>{feedback.text}</div>}

                    {!sinStock && (
                        <div className="quantity-row">
                            <label htmlFor="cantidad">Cantidad</label>
                            <div className="quantity-control">
                                <button onClick={() => setCantidad((c) => Math.max(1, c - 1))}>-</button>
                                <input
                                    id="cantidad"
                                    type="number"
                                    min="1"
                                    max={producto.stock}
                                    value={cantidad}
                                    onChange={(e) =>
                                        setCantidad(Math.min(producto.stock, Math.max(1, Number(e.target.value) || 1)))
                                    }
                                />
                                <button onClick={() => setCantidad((c) => Math.min(producto.stock, c + 1))}>+</button>
                            </div>
                        </div>
                    )}

                    <div className="product-detail-actions">
                        <button className="btn btn-primary btn-lg" disabled={sinStock || adding} onClick={handleAddToCart}>
                            {adding ? 'Agregando…' : sinStock ? 'Sin stock' : 'Agregar al carrito'}
                        </button>
                        <Link to="/carrito" className="btn btn-secondary btn-lg">Ver carrito</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
