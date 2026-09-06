// src/AuthConfig.js

const clientId = import.meta.env.VITE_AZURE_CLIENT_ID;
const tenantId = import.meta.env.VITE_AZURE_TENANT_ID;
const scope = import.meta.env.VITE_AZURE_SCOPE;

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

// URLs de los microservicios leídas directo del entorno
export const ENDPOINTS = {
    USUARIOS: import.meta.env.VITE_MS_USUARIOS_URL,
    PRODUCTOS: import.meta.env.VITE_MS_PRODUCTOS_URL,
    CARRITO: import.meta.env.VITE_MS_CARRITO_URL,
};
