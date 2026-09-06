// src/pages/Home.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { loginRequest } from '../AuthConfig';
import { fetchProductos } from '../api/apiService';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

export default function Home({ searchQuery = '' }) {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categoria, setCategoria] = useState('Todos');
    const [addingId, setAddingId] = useState(null);
    const [feedback, setFeedback] = useState(null);

    const { addItem } = useCart();
    const isAuthenticated = useIsAuthenticated();
    const { instance } = useMsal();

    useEffect(() => {
        let activo = true;
        setLoading(true);
        fetchProductos()
            .then((data) => {
                if (activo) setProductos(data);
            })
            .catch((err) => {
                if (activo) setError(err.message);
            })
            .finally(() => {
                if (activo) setLoading(false);
            });
        return () => {
            activo = false;
        };
    }, []);

    const categorias = useMemo(() => {
        const unicas = Array.from(new Set(productos.map((p) => p.categoria).filter(Boolean)));
        return ['Todos', ...unicas];
    }, [productos]);

    const productosFiltrados = useMemo(() => {
        return productos.filter((p) => {
            const coincideCategoria = categoria === 'Todos' || p.categoria === categoria;
            const coincideBusqueda = !searchQuery ||
                p.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.descripcion?.toLowerCase().includes(searchQuery.toLowerCase());
            return coincideCategoria && coincideBusqueda;
        });
    }, [productos, categoria, searchQuery]);

    const handleAddToCart = async (producto) => {
        if (!isAuthenticated) {
            setFeedback({ type: 'error', text: 'Inicia sesión para agregar productos al carrito.' });
            try {
                await instance.loginPopup(loginRequest);
            } catch (err) {
                console.error(err);
            }
            return;
        }
        setAddingId(producto.id);
        const result = await addItem(producto.id, 1);
        setAddingId(null);
        setFeedback(
            result.ok
                ? { type: 'success', text: `${producto.nombre} se agregó al carrito.` }
                : { type: 'error', text: result.message || 'No se pudo agregar el producto.' }
        );
        setTimeout(() => setFeedback(null), 3000);
    };

    return (
        <div className="page home-page">
            <section className="hero">
                <div className="hero-text">
                    <span className="hero-eyebrow">Envíos a todo Chile</span>
                    <h1>La tecnología que buscas, al mejor precio</h1>
                    <p>Notebooks, celulares, componentes, audio y gaming — todo en un solo lugar.</p>
                </div>
            </section>

            {feedback && (
                <div className={`alert alert-${feedback.type}`}>{feedback.text}</div>
            )}

            <div className="catalog-toolbar">
                <div className="category-chips">
                    {categorias.map((cat) => (
                        <button
                            key={cat}
                            className={`chip ${categoria === cat ? 'chip-active' : ''}`}
                            onClick={() => setCategoria(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                {searchQuery && (
                    <p className="search-result-hint">
                        Resultados para «{searchQuery}»
                    </p>
                )}
            </div>

            {loading && <p className="state-message">Cargando catálogo…</p>}
            {error && <p className="state-message state-error">No se pudo cargar el catálogo: {error}</p>}

            {!loading && !error && productosFiltrados.length === 0 && (
                <div className="empty-state">
                    <div className="empty-state-icon">🛍️</div>
                    <h3>Aún no hay productos {categoria !== 'Todos' ? `en «${categoria}»` : 'publicados'}</h3>
                    <p>Muy pronto encontrarás aquí el catálogo completo de tecnología y electrónica.</p>
                </div>
            )}

            <div className="product-grid">
                {productosFiltrados.map((producto) => (
                    <ProductCard
                        key={producto.id}
                        producto={producto}
                        onAddToCart={handleAddToCart}
                        adding={addingId === producto.id}
                    />
                ))}
            </div>
        </div>
    );
}
