import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Account from './pages/Account'
import Admin from './pages/Admin'

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="app-shell">
      <Navbar onSearch={setSearchQuery} />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home searchQuery={searchQuery} />} />
          <Route path="/producto/:id" element={<ProductDetail />} />
          <Route path="/carrito" element={<Cart />} />
          <Route
            path="/cuenta"
            element={
              <>
                <AuthenticatedTemplate>
                  <Account />
                </AuthenticatedTemplate>
                <UnauthenticatedTemplate>
                  <div className="page state-message">Inicia sesión para ver tu cuenta.</div>
                </UnauthenticatedTemplate>
              </>
            }
          />
          <Route
            path="/admin"
            element={
              <>
                <AuthenticatedTemplate>
                  <Admin />
                </AuthenticatedTemplate>
                <UnauthenticatedTemplate>
                  <div className="page state-message">Inicia sesión para administrar el catálogo.</div>
                </UnauthenticatedTemplate>
              </>
            }
          />
          <Route path="*" element={<div className="page state-message">Página no encontrada.</div>} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}
