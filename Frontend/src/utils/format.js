// src/utils/format.js
const clp = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
});

export const formatPrice = (value) => clp.format(Number(value) || 0);
