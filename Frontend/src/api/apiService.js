// src/apiService.js
import { apiRequest, ENDPOINTS } from '../AuthConfig';

// Función auxiliar para obtener el token silenciosamente
export const getAccessToken = async (msalInstance) => {
    const activeAccount = msalInstance.getActiveAccount();
    if (!activeAccount) throw new Error("No hay un usuario autenticado.");

    const request = {
        ...apiRequest,
        account: activeAccount
    };

    try {
        const response = await msalInstance.acquireTokenSilent(request);
        return response.accessToken;
    } catch (error) {
        const response = await msalInstance.acquireTokenPopup(request);
        return response.accessToken;
    }
};

// --- MS-PRODUCTOS ---
// Obtener productos (Público)
export const fetchProductos = async () => {
    const res = await fetch(ENDPOINTS.PRODUCTOS);
    if (!res.ok) throw new Error("Error al obtener productos");
    return res.json();
};

// --- MS-CARRITO ---
// Obtener el carrito del usuario (Protegido)
export const fetchCarrito = async (msalInstance) => {
    const token = await getAccessToken(msalInstance);
    const res = await fetch(ENDPOINTS.CARRITO, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Error al obtener el carrito");
    return res.json();
};

// Agregar ítem al carrito (Protegido)
export const agregarAlCarrito = async (msalInstance, productoId, cantidad) => {
    const token = await getAccessToken(msalInstance);
    const res = await fetch(`${ENDPOINTS.CARRITO}/items`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productoId, cantidad })
    });
    if (!res.ok) throw new Error("Error al agregar producto al carrito");
    return res.json();
};

// Función auxiliar para token Bearer
export const getAccessToken = async (msalInstance) => {
    const activeAccount = msalInstance.getActiveAccount();
    if (!activeAccount) throw new Error("No hay un usuario autenticado.");

    const request = { ...apiRequest, account: activeAccount };

    try {
        const response = await msalInstance.acquireTokenSilent(request);
        return response.accessToken;
    } catch (error) {
        const response = await msalInstance.acquireTokenPopup(request);
        return response.accessToken;
    }
};

// --- MS-CARRITO ---

// Obtener carrito del usuario
export const fetchCarrito = async (msalInstance) => {
    const token = await getAccessToken(msalInstance);
    const res = await fetch(ENDPOINTS.CARRITO, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Error al obtener el carrito");
    return res.json();
};

// Modificar cantidad de un ítem
export const actualizarCantidadItem = async (msalInstance, itemId, cantidad) => {
    const token = await getAccessToken(msalInstance);
    const res = await fetch(`${ENDPOINTS.CARRITO}/items/${itemId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cantidad })
    });
    if (!res.ok) throw new Error("Error al actualizar la cantidad");
    return res.json();
};

// Eliminar un ítem del carrito
export const eliminarItem = async (msalInstance, itemId) => {
    const token = await getAccessToken(msalInstance);
    const res = await fetch(`${ENDPOINTS.CARRITO}/items/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Error al eliminar el producto");
    return res.ok;
};

// Vaciar todo el carrito
export const vaciarCarrito = async (msalInstance) => {
    const token = await getAccessToken(msalInstance);
    const res = await fetch(ENDPOINTS.CARRITO, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Error al vaciar el carrito");
    return res.ok;
};

