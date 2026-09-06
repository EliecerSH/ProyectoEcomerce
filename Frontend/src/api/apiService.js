// src/api/apiService.js
// Capa de acceso a los 3 microservicios: ms-productos, ms-carrito y ms-usuarios.
import { apiRequest, ENDPOINTS } from '../AuthConfig';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Obtiene el access token del usuario activo (silencioso, con fallback a popup)
export const getAccessToken = async (msalInstance) => {
    const activeAccount = msalInstance.getActiveAccount();
    if (!activeAccount) throw new Error('No hay un usuario autenticado.');

    const request = { ...apiRequest, account: activeAccount };

    try {
        const response = await msalInstance.acquireTokenSilent(request);
        return response.accessToken;
    } catch (error) {
        const response = await msalInstance.acquireTokenPopup(request);
        return response.accessToken;
    }
};

const authHeaders = (token) => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
});

// Lee el cuerpo de una respuesta de error de forma segura (puede venir vacío o no ser JSON)
const parseError = async (res, fallback) => {
    try {
        const data = await res.json();
        return data?.mensaje || data?.error || fallback;
    } catch {
        return fallback;
    }
};

// ---------------------------------------------------------------------------
// MS-PRODUCTOS
// ---------------------------------------------------------------------------

// GET /productos -> catálogo completo (público)
export const fetchProductos = async () => {
    const res = await fetch(ENDPOINTS.PRODUCTOS);
    if (!res.ok) throw new Error(await parseError(res, 'Error al obtener los productos'));
    return res.json();
};

// GET /productos/{id} (público)
export const fetchProductoPorId = async (id) => {
    const res = await fetch(`${ENDPOINTS.PRODUCTOS}/${id}`);
    if (!res.ok) throw new Error(await parseError(res, 'Producto no encontrado'));
    return res.json();
};

// GET /productos/categoria/{categoria} (público)
export const fetchProductosPorCategoria = async (categoria) => {
    const res = await fetch(`${ENDPOINTS.PRODUCTOS}/categoria/${encodeURIComponent(categoria)}`);
    if (!res.ok) throw new Error(await parseError(res, 'Error al filtrar por categoría'));
    return res.json();
};

// POST /productos (protegido)
export const crearProducto = async (msalInstance, producto) => {
    const token = await getAccessToken(msalInstance);
    const res = await fetch(ENDPOINTS.PRODUCTOS, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(producto),
    });
    if (!res.ok) throw new Error(await parseError(res, 'Error al crear el producto'));
    return res.json();
};

// PUT /productos/{id} (protegido)
export const actualizarProducto = async (msalInstance, id, producto) => {
    const token = await getAccessToken(msalInstance);
    const res = await fetch(`${ENDPOINTS.PRODUCTOS}/${id}`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify(producto),
    });
    if (!res.ok) throw new Error(await parseError(res, 'Error al actualizar el producto'));
    return res.json();
};

// DELETE /productos/{id} (protegido)
export const eliminarProducto = async (msalInstance, id) => {
    const token = await getAccessToken(msalInstance);
    const res = await fetch(`${ENDPOINTS.PRODUCTOS}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(await parseError(res, 'Error al eliminar el producto'));
    return true;
};

// ---------------------------------------------------------------------------
// MS-CARRITO (todo protegido)
// ---------------------------------------------------------------------------

// GET /carrito
export const fetchCarrito = async (msalInstance) => {
    const token = await getAccessToken(msalInstance);
    const res = await fetch(ENDPOINTS.CARRITO, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(await parseError(res, 'Error al obtener el carrito'));
    return res.json();
};

// POST /carrito/items -> suma "cantidad" al producto (lo crea si no existía)
export const agregarAlCarrito = async (msalInstance, productoId, cantidad) => {
    const token = await getAccessToken(msalInstance);
    const res = await fetch(`${ENDPOINTS.CARRITO}/items`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ productoId, cantidad }),
    });
    if (!res.ok) throw new Error(await parseError(res, 'Error al agregar el producto al carrito'));
    return res.json();
};

// DELETE /carrito/items/{productoId}
export const eliminarDelCarrito = async (msalInstance, productoId) => {
    const token = await getAccessToken(msalInstance);
    const res = await fetch(`${ENDPOINTS.CARRITO}/items/${productoId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(await parseError(res, 'Error al eliminar el producto del carrito'));
    return res.json();
};

// El backend no expone un PUT para fijar una cantidad absoluta: solo sabe "sumar".
// Para editar la cantidad desde la UI, se elimina el ítem y se vuelve a agregar
// con la cantidad final deseada.
export const actualizarCantidadCarrito = async (msalInstance, productoId, nuevaCantidad) => {
    await eliminarDelCarrito(msalInstance, productoId);
    if (nuevaCantidad > 0) {
        return agregarAlCarrito(msalInstance, productoId, nuevaCantidad);
    }
    return fetchCarrito(msalInstance);
};

// DELETE /carrito -> vacía todo el carrito
export const vaciarCarrito = async (msalInstance) => {
    const token = await getAccessToken(msalInstance);
    const res = await fetch(ENDPOINTS.CARRITO, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(await parseError(res, 'Error al vaciar el carrito'));
    return true;
};

// ---------------------------------------------------------------------------
// MS-USUARIOS (todo protegido, salvo lo indicado)
// ---------------------------------------------------------------------------

// GET /usuarios/me -> claims del JWT (siempre disponible si hay sesión)
export const fetchClaimsUsuario = async (msalInstance) => {
    const token = await getAccessToken(msalInstance);
    const res = await fetch(`${ENDPOINTS.USUARIOS}/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(await parseError(res, 'Error al obtener el usuario autenticado'));
    return res.json();
};

// GET /usuarios/{id}
export const fetchUsuario = async (msalInstance, id) => {
    const token = await getAccessToken(msalInstance);
    const res = await fetch(`${ENDPOINTS.USUARIOS}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(await parseError(res, 'Error al obtener el perfil'));
    return res.json();
};

// POST /usuarios -> registra el perfil (rol y azureOid se fuerzan en el backend)
export const registrarUsuario = async (msalInstance, datosPerfil) => {
    const token = await getAccessToken(msalInstance);
    const res = await fetch(ENDPOINTS.USUARIOS, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(datosPerfil),
    });
    if (!res.ok) throw new Error(await parseError(res, 'Error al registrar el perfil'));
    return res.json();
};

// PUT /usuarios/{id}
export const actualizarUsuario = async (msalInstance, id, datosPerfil) => {
    const token = await getAccessToken(msalInstance);
    const res = await fetch(`${ENDPOINTS.USUARIOS}/${id}`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify(datosPerfil),
    });
    if (!res.ok) throw new Error(await parseError(res, 'Error al actualizar el perfil'));
    return res.json();
};
