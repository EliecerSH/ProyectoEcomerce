// src/components/Footer.jsx
import React from 'react';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-inner">
                <div className="footer-brand">
                    <span className="brand-mark">⚡</span>
                    <span className="brand-name">Nexus<span className="brand-accent">Tech</span></span>
                    <p>Tecnología y electrónica al mejor precio.</p>
                </div>
                <div className="footer-col">
                    <h4>Categorías</h4>
                    <p>Notebooks · Celulares · Componentes · Audio · Gaming</p>
                </div>
                <div className="footer-col">
                    <h4>Ayuda</h4>
                    <p>Envíos · Cambios y devoluciones · Garantía</p>
                </div>
            </div>
            <div className="footer-bottom">
                © {new Date().getFullYear()} NexusTech. Todos los derechos reservados.
            </div>
        </footer>
    );
}
