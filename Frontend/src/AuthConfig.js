// src/AuthConfig.js
// Configuración de autenticación (Azure AD / MSAL) y URLs de los microservicios.

const clientId = import.meta.env.VITE_AZURE_CLIENT_ID || "449c58be-c791-478c-b8a5-ba5a79589f55";
const tenantId = import.meta.env.VITE_AZURE_TENANT_ID || "e5372bf0-c5e3-4286-887c-79069f209c1f";
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
    scopes: ["User.Read"],
};

export const apiRequest = {
    scopes: [scope],
};

// URLs base de los microservicios (cada uno expone su propio prefijo /api/v1/...)
export const ENDPOINTS = {
    USUARIOS: import.meta.env.VITE_MS_USUARIOS_URL || "http://localhost:8081/api/v1/usuarios",
    PRODUCTOS: import.meta.env.VITE_MS_PRODUCTOS_URL || "http://localhost:8082/api/v1/productos",
    CARRITO: import.meta.env.VITE_MS_CARRITO_URL || "http://localhost:8083/api/v1/carrito",
};
