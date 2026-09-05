const clientId = import.meta.env.VITE_AZURE_CLIENT_ID || ;
const tenantId = import.meta.env.VITE_AZURE_TENANT_ID || ;
const scope = import.meta.env.VITE_AZURE_SCOPE || `api://${clientId}/write-read`;

export const msalConfig = {
    auth: {
        clientId: clientId,
        authority: `https://login.microsoftonline.com/${tenantId}`,
        redirectUri: window.location.origin + "/",
        postLogoutRedirectUri: window.location.origin + "/",
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    },
};

export const loginRequest = {
    scopes: ["User.Read"]
};

export const apiRequest = {
    scopes: [scope]
};

// URLs de los Microservicios
export const ENDPOINTS = {
    USUARIOS: import.meta.env.VITE_MS_USUARIOS_URL || "http://localhost:8081/api/v1",
    PRODUCTOS: import.meta.env.VITE_MS_PRODUCTOS_URL || "http://localhost:8082/api/v1/productos",
    CARRITO: import.meta.env.VITE_MS_CARRITO_URL || "http://localhost:8083/api/v1/carrito"
};

// Agrega esta línea al final de src/AuthConfig.js:
export const API_BASE_URL = ENDPOINTS.USUARIOS;