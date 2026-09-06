// src/pages/Account.jsx
// Nota: ms-usuarios no expone un endpoint "mi perfil" por OID; solo permite
// GET/PUT /usuarios/{id} validando que el id pertenezca al usuario autenticado.
// Por eso, tras registrar el perfil una vez, guardamos su id localmente
// (asociado al oid de Azure) para poder recuperarlo en próximas visitas.
import React, { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { fetchClaimsUsuario, fetchUsuario, registrarUsuario, actualizarUsuario } from '../api/apiService';

const storageKey = (oid) => `nexustech.perfilId.${oid}`;

const emptyForm = { nombre: '', direccion: '', comuna: '', region: '', ciudad: '' };

export default function Account() {
    const { instance, accounts } = useMsal();
    const activeAccount = accounts[0];

    const [claims, setClaims] = useState(null);
    const [perfilId, setPerfilId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState(null);

    useEffect(() => {
        let activo = true;

        (async () => {
            setLoading(true);
            try {
                const claimsData = await fetchClaimsUsuario(instance);
                if (!activo) return;
                setClaims(claimsData);

                const oid = claimsData.oid || claimsData.sub;
                const idGuardado = oid ? localStorage.getItem(storageKey(oid)) : null;

                if (idGuardado) {
                    const usuario = await fetchUsuario(instance, idGuardado);
                    if (!activo) return;
                    setPerfilId(usuario.id);
                    setForm({
                        nombre: usuario.nombre || '',
                        direccion: usuario.direccion || '',
                        comuna: usuario.comuna || '',
                        region: usuario.region || '',
                        ciudad: usuario.ciudad || '',
                    });
                }
            } catch (err) {
                if (activo) setFeedback({ type: 'error', text: err.message });
            } finally {
                if (activo) setLoading(false);
            }
        })();

        return () => {
            activo = false;
        };
    }, [instance]);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFeedback(null);
        try {
            if (perfilId) {
                const actualizado = await actualizarUsuario(instance, perfilId, form);
                setForm({
                    nombre: actualizado.nombre || '',
                    direccion: actualizado.direccion || '',
                    comuna: actualizado.comuna || '',
                    region: actualizado.region || '',
                    ciudad: actualizado.ciudad || '',
                });
            } else {
                const nuevo = await registrarUsuario(instance, form);
                setPerfilId(nuevo.id);
                const oid = claims?.oid || claims?.sub;
                if (oid) localStorage.setItem(storageKey(oid), nuevo.id);
            }
            setFeedback({ type: 'success', text: 'Perfil guardado correctamente.' });
        } catch (err) {
            setFeedback({ type: 'error', text: err.message });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="page state-message">Cargando tu cuenta…</div>;

    return (
        <div className="page account-page">
            <h1>Mi cuenta</h1>

            <div className="account-summary card">
                <span className="avatar avatar-lg">{activeAccount?.name?.charAt(0) || 'U'}</span>
                <div>
                    <h3>{activeAccount?.name}</h3>
                    <p>{activeAccount?.username || claims?.email}</p>
                </div>
            </div>

            {feedback && <div className={`alert alert-${feedback.type}`}>{feedback.text}</div>}

            <form className="account-form card" onSubmit={handleSubmit}>
                <h3>{perfilId ? 'Datos de envío' : 'Completa tu perfil'}</h3>
                <p className="form-hint">
                    {perfilId
                        ? 'Actualiza tu información de contacto y despacho.'
                        : 'Necesitamos estos datos para poder despachar tus pedidos.'}
                </p>

                <div className="form-grid">
                    <label>
                        Nombre completo
                        <input name="nombre" value={form.nombre} onChange={handleChange} required />
                    </label>
                    <label>
                        Dirección
                        <input name="direccion" value={form.direccion} onChange={handleChange} required />
                    </label>
                    <label>
                        Comuna
                        <input name="comuna" value={form.comuna} onChange={handleChange} required />
                    </label>
                    <label>
                        Ciudad
                        <input name="ciudad" value={form.ciudad} onChange={handleChange} required />
                    </label>
                    <label>
                        Región
                        <input name="region" value={form.region} onChange={handleChange} required />
                    </label>
                </div>

                <button className="btn btn-primary" type="submit" disabled={saving}>
                    {saving ? 'Guardando…' : perfilId ? 'Guardar cambios' : 'Registrar perfil'}
                </button>
            </form>
        </div>
    );
}
