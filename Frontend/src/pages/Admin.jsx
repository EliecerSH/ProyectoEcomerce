// src/pages/Admin.jsx
import React, { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import {
    fetchProductos,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
} from '../api/apiService';
import ProductImage from '../components/ProductImage';
import { formatPrice } from '../utils/format';

const emptyForm = {
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoria: '',
    imagenUrl: '',
};

export default function Admin() {
    const { instance } = useMsal();
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(emptyForm);
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const cargarProductos = async () => {
        setLoading(true);
        try {
            const data = await fetchProductos();
            setProductos(data);
        } catch (err) {
            setFeedback({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarProductos();
    }, []);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const startEdit = (producto) => {
        setEditId(producto.id);
        setForm({
            nombre: producto.nombre || '',
            descripcion: producto.descripcion || '',
            precio: producto.precio ?? '',
            stock: producto.stock ?? '',
            categoria: producto.categoria || '',
            imagenUrl: producto.imagenUrl || '',
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditId(null);
        setForm(emptyForm);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFeedback(null);

        const payload = {
            nombre: form.nombre,
            descripcion: form.descripcion,
            precio: Number(form.precio),
            stock: Number(form.stock),
            categoria: form.categoria,
            imagenUrl: form.imagenUrl || null,
        };

        try {
            if (editId) {
                await actualizarProducto(instance, editId, payload);
                setFeedback({ type: 'success', text: 'Producto actualizado.' });
            } else {
                await crearProducto(instance, payload);
                setFeedback({ type: 'success', text: 'Producto creado.' });
            }
            cancelEdit();
            cargarProductos();
        } catch (err) {
            setFeedback({ type: 'error', text: err.message });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (producto) => {
        if (!window.confirm(`¿Eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`)) return;
        try {
            await eliminarProducto(instance, producto.id);
            setFeedback({ type: 'success', text: 'Producto eliminado.' });
            if (editId === producto.id) cancelEdit();
            cargarProductos();
        } catch (err) {
            setFeedback({ type: 'error', text: err.message });
        }
    };

    return (
        <div className="page admin-page">
            <h1>Gestión de productos</h1>
            <p className="form-hint">Aquí puedes publicar, editar o retirar productos del catálogo.</p>

            {feedback && <div className={`alert alert-${feedback.type}`}>{feedback.text}</div>}

            <form className="admin-form card" onSubmit={handleSubmit}>
                <h3>{editId ? 'Editar producto' : 'Nuevo producto'}</h3>
                <div className="form-grid">
                    <label>
                        Nombre
                        <input name="nombre" value={form.nombre} onChange={handleChange} required />
                    </label>
                    <label>
                        Categoría
                        <input name="categoria" value={form.categoria} onChange={handleChange} required placeholder="Notebooks, Celulares, Audio…" />
                    </label>
                    <label>
                        Precio (CLP)
                        <input name="precio" type="number" min="0" value={form.precio} onChange={handleChange} required />
                    </label>
                    <label>
                        Stock
                        <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} required />
                    </label>
                    <label className="form-span-2">
                        URL de imagen
                        <input name="imagenUrl" value={form.imagenUrl} onChange={handleChange} placeholder="https://…" />
                    </label>
                    <label className="form-span-2">
                        Descripción
                        <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={3} />
                    </label>
                </div>

                <div className="admin-form-actions">
                    <button className="btn btn-primary" type="submit" disabled={saving}>
                        {saving ? 'Guardando…' : editId ? 'Guardar cambios' : 'Publicar producto'}
                    </button>
                    {editId && (
                        <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
                            Cancelar
                        </button>
                    )}
                </div>
            </form>

            <h3 className="admin-list-title">Catálogo actual ({productos.length})</h3>

            {loading && <p className="state-message">Cargando productos…</p>}

            {!loading && productos.length === 0 && (
                <div className="empty-state">
                    <div className="empty-state-icon">📦</div>
                    <h3>Todavía no has publicado productos</h3>
                    <p>Usa el formulario de arriba para agregar el primero.</p>
                </div>
            )}

            <div className="admin-table">
                {productos.map((producto) => (
                    <div className="admin-row" key={producto.id}>
                        <ProductImage src={producto.imagenUrl} alt={producto.nombre} className="admin-row-image" />
                        <div className="admin-row-info">
                            <strong>{producto.nombre}</strong>
                            <span>{producto.categoria}</span>
                        </div>
                        <span className="admin-row-price">{formatPrice(producto.precio)}</span>
                        <span className={`stock-indicator ${producto.stock > 0 ? 'stock-in' : 'stock-out'}`}>
                            {producto.stock > 0 ? `${producto.stock} en stock` : 'Sin stock'}
                        </span>
                        <div className="admin-row-actions">
                            <button className="btn btn-secondary btn-sm" onClick={() => startEdit(producto)}>Editar</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(producto)}>Eliminar</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
