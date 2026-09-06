// src/context/CartContext.jsx
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import {
    fetchCarrito,
    agregarAlCarrito,
    eliminarDelCarrito,
    actualizarCantidadCarrito,
    vaciarCarrito,
} from '../api/apiService';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const { instance } = useMsal();
    const isAuthenticated = useIsAuthenticated();

    const [carrito, setCarrito] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const refreshCart = useCallback(async () => {
        if (!isAuthenticated) {
            setCarrito(null);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const data = await fetchCarrito(instance);
            setCarrito(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [instance, isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) {
            refreshCart();
        } else {
            setCarrito(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    const addItem = useCallback(async (productoId, cantidad = 1) => {
        setLoading(true);
        setError(null);
        try {
            const data = await agregarAlCarrito(instance, productoId, cantidad);
            setCarrito(data);
            return { ok: true };
        } catch (err) {
            setError(err.message);
            return { ok: false, message: err.message };
        } finally {
            setLoading(false);
        }
    }, [instance]);

    const removeItem = useCallback(async (productoId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await eliminarDelCarrito(instance, productoId);
            setCarrito(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [instance]);

    const updateQuantity = useCallback(async (productoId, nuevaCantidad) => {
        setLoading(true);
        setError(null);
        try {
            const data = await actualizarCantidadCarrito(instance, productoId, nuevaCantidad);
            setCarrito(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [instance]);

    const clearCart = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            await vaciarCarrito(instance);
            setCarrito((prev) => (prev ? { ...prev, items: [], total: 0 } : prev));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [instance]);

    const itemCount = useMemo(
        () => (carrito?.items || []).reduce((acc, it) => acc + it.cantidad, 0),
        [carrito]
    );

    const value = {
        carrito,
        items: carrito?.items || [],
        total: carrito?.total || 0,
        itemCount,
        loading,
        error,
        refreshCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart debe usarse dentro de un <CartProvider>');
    return ctx;
}
