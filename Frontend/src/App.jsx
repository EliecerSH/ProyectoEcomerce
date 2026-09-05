import React, { useState } from 'react'
import { useMsal, AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react'
import { loginRequest, apiRequest, API_BASE_URL } from './AuthConfig'

export default function App() {
  const { instance, accounts } = useMsal();
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tokenInfo, setTokenInfo] = useState(null);

  const activeAccount = accounts[0];

  // Iniciar sesión interactiva con Popup de Microsoft
  const handleLogin = async () => {
    try {
      await instance.loginPopup(loginRequest);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Error en login: " + error.message);
    }
  };

  // Cerrar sesión
  const handleLogout = () => {
    instance.logoutPopup({
      postLogoutRedirectUri: window.location.origin,
    });
  };

  // 1. Probar endpoint público (sin token)
  const callPublicApi = async () => {
    setLoading(true);
    setApiResponse(null);
    try {
      const response = await fetch(`${API_BASE_URL}/public`);
      const data = await response.json();
      setApiResponse({ status: response.status, data });
    } catch (error) {
      setApiResponse({ status: "ERROR", error: error.message });
    } finally {
      setLoading(false);
    }
  };

  // 2. Probar endpoint protegido (obteniendo y enviando el JWT de Azure)
  const callSecuredApi = async () => {
    setLoading(true);
    setApiResponse(null);
    try {
      // Obtener el token silenciosamente
      const request = {
        ...apiRequest,
        account: activeAccount
      };

      let tokenResponse;
      try {
        tokenResponse = await instance.acquireTokenSilent(request);
      } catch (e) {
        // Fallback a popup si expira o requiere consentimiento
        tokenResponse = await instance.acquireTokenPopup(request);
      }

      setTokenInfo(tokenResponse.accessToken);

      // Llamar al backend con la cabecera Authorization: Bearer <token>
      const response = await fetch(`${API_BASE_URL}`, {
        headers: {
          Authorization: `Bearer ${tokenResponse.accessToken}`
        }
      });

      const data = await response.json();
      setApiResponse({ status: response.status, data });
    } catch (error) {
      setApiResponse({ status: "ERROR", error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <div className="badge">Cloud Native 1 • DSY1107</div>
        <h1>Laboratorio de Autenticación con Azure Entra ID & Spring Boot</h1>
        <p className="subtitle">Demostración interactiva de Frontend React con librería MSAL</p>
      </header>

      {/* VISTA CUANDO NO ESTÁ AUTENTICADO */}
      <UnauthenticatedTemplate>
        <div className="card login-card">
          <div className="icon">🔒</div>
          <h2>Sesión No Iniciada</h2>
          <p>Para consumir los servicios seguros de la nube, debes autenticarte con tu cuenta institucional de Microsoft.</p>
          <button className="btn btn-primary" onClick={handleLogin}>
            <span>🔑</span> Iniciar Sesión con Microsoft
          </button>
        </div>
      </UnauthenticatedTemplate>

      {/* VISTA CUANDO EL USUARIO ESTÁ AUTENTICADO */}
      <AuthenticatedTemplate>
        <div className="card profile-card">
          <div className="profile-header">
            <div className="avatar">
              {activeAccount?.name ? activeAccount.name.charAt(0) : "U"}
            </div>
            <div>
              <h2>¡Bienvenido, {activeAccount?.name}!</h2>
              <p className="user-email">{activeAccount?.username}</p>
            </div>
            <button className="btn btn-secondary logout-btn" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
        </div>

        <div className="card test-card">
          <h3>🧪 Banco de Pruebas de API</h3>
          <p className="description">
            Prueba cómo interactúa el frontend con el backend Spring Boot (Resource Server):
          </p>

          <div className="button-group">
            <button className="btn btn-public" onClick={callPublicApi} disabled={loading}>
              🌐 Probar Endpoint Público (/api/v1/public)
            </button>
            <button className="btn btn-secure" onClick={callSecuredApi} disabled={loading}>
              🛡️ Probar Endpoint Seguro con JWT (/api/v1)
            </button>
          </div>

          {loading && <div className="loading">⏳ Consultando al backend...</div>}

          {/* RESPUESTA DEL BACKEND */}
          {apiResponse && (
            <div className="response-box">
              <div className="response-header">
                <strong>Respuesta HTTP:</strong>
                <span className={`status-pill status-${apiResponse.status}`}>
                  Código: {apiResponse.status}
                </span>
              </div>
              <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
            </div>
          )}

          {/* VISUALIZADOR DEL TOKEN OBTENIDO */}
          {tokenInfo && (
            <div className="token-box">
              <details>
                <summary>🔍 Ver Token JWT emitido por Azure (recortado)</summary>
                <p className="token-text">{tokenInfo}</p>
              </details>
            </div>
          )}
        </div>
      </AuthenticatedTemplate>
    </div>
  )
}
