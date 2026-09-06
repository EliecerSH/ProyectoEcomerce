// src/components/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import ProductImage from './ProductImage';
import { formatPrice } from '../utils/format';

export default function ProductCard({ producto, onAddToCart, adding }) {
    const sinStock = !producto.stock || producto.stock <= 0;

    return (
        <div className="product-card">
            <Link to={`/producto/${producto.id}`} className="product-card-media">
                <ProductImage src={producto.imagenUrl} alt={producto.nombre} />
                {sinStock && <span className="badge badge-outstock">Sin stock</span>}
                {producto.categoria && <span className="badge badge-category">{producto.categoria}</span>}
            </Link>
            <div className="product-card-body">
                <Link to={`/producto/${producto.id}`} className="product-card-title">
                    {producto.nombre}
                </Link>
                {producto.descripcion && (
                    <p className="product-card-desc">{producto.descripcion}</p>
                )}
                <div className="product-card-footer">
                    <span className="product-card-price">{formatPrice(producto.precio)}</span>
                    <button
                        className="btn btn-add"
                        disabled={sinStock || adding}
                        onClick={() => onAddToCart?.(producto)}
                    >
                        {adding ? 'Agregando…' : 'Agregar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
