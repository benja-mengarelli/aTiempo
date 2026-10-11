import { db } from '../services/firebase';
import {
    doc,
    getDoc,
    setDoc,
    runTransaction,
    serverTimestamp,
} from 'firebase/firestore';

// Sin O/0 ni I/1 (se confunden al leerlos/tipearlos)
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generarCodigoCorto(longitud = 6) {
    let resultado = '';
    for (let i = 0; i < longitud; i++) {
        resultado += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
    return resultado;
}

async function codigoUnico(collectionPath) {
    for (let intento = 0; intento < 5; intento++) {
        const candidato = generarCodigoCorto();
        const snap = await getDoc(doc(db, `${collectionPath}/${candidato}`));
        if (!snap.exists()) return candidato;
    }
    throw new Error('No se pudo generar un código único, probá de nuevo.');
}

// Mismo criterio que ya usás para el id de empresa (ej: "club_telefono"):
// minúsculas, sin acentos, espacios -> guion bajo. NUNCA guiones (el "-" se
// reserva como separador en el código compuesto "empresaId-codigo").
function derivarSlug(nombre) {
    return nombre
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s_]/g, '')
        .trim()
        .replace(/\s+/g, '_');
}

// ============================================================
// GENERACIÓN (superAdmin crea empresas, admin invita usuarios)
// ============================================================

/**
 * Solo superAdmin. Devuelve el código "pelado" (sin compuesto) para
 * compartir - al canjearlo, se crea la empresa y el que canjea queda
 * como su primer admin.
 */
export async function generarCodigoCrearEmpresa(nombreEmpresa, superAdminUid) {
    const empresaId = derivarSlug(nombreEmpresa);
    if (!empresaId) throw new Error('Nombre de empresa inválido.');

    const yaExiste = await getDoc(doc(db, 'empresas', empresaId));
    if (yaExiste.exists()) {
        throw new Error(`Ya existe una empresa asociada a "${empresaId}". Probá con otro nombre.`);
    }

    const codigo = await codigoUnico('codigosInvitacion');
    await setDoc(doc(db, `codigosInvitacion/${codigo}`), {
        tipo: 'crear_empresa',
        empresaId,
        nombreEmpresa,
        usado: false,
        usadoPor: null,
        fechaUso: null,
        empresaCreada: null,
        creadoPor: superAdminUid,
        fechaCreacion: serverTimestamp(),
    });

    return codigo;
}

/**
 * Admin de una empresa existente. Devuelve el código COMPUESTO
 * ("empresaId-codigo") - es ese el que hay que compartir, no el pelado.
 * El rol que asigna siempre es "usuario" (igual que ya definimos).
 */
export async function generarCodigoUnirse(empresaId, nombreEmpresa, adminUid) {
    const codigo = await codigoUnico(`empresas/${empresaId}/codigosInvitacion`);
    await setDoc(doc(db, `empresas/${empresaId}/codigosInvitacion/${codigo}`), {
        nombreEmpresa,
        rolAsignado: 'usuario',
        usado: false,
        usadoPor: null,
        fechaUso: null,
        creadoPor: adminUid,
        fechaCreacion: serverTimestamp(),
    });

    return `${empresaId}-${codigo}`;
}

// ============================================================
// CANJE (lo usa cualquier usuario autenticado, desde PantallaEmpresas)
// ============================================================

async function canjearCrearEmpresa(codigo, user, nombre) {
    const codigoRef = doc(db, 'codigosInvitacion', codigo);

    return runTransaction(db, async (tx) => {
        const codigoSnap = await tx.get(codigoRef);
        if (!codigoSnap.exists()) throw new Error('Código inválido.');
        const datos = codigoSnap.data();
        if (datos.usado) throw new Error('Este código ya fue usado.');

        const empresaId = datos.empresaId;
        const empresaRef = doc(db, 'empresas', empresaId);
        const miembroRef = doc(db, 'empresas', empresaId, 'miembros', user.uid);
        const indiceRef = doc(db, 'users', user.uid, 'empresas', empresaId);

        tx.set(empresaRef, {
            nombre: datos.nombreEmpresa,
            creadoPor: user.uid,
            fechaCreacion: serverTimestamp(),
            codigoUsado: codigo,
        });

        tx.set(miembroRef, {
            nombre,
            rol: 'admin',
            activo: true,
            fechaIngreso: serverTimestamp(),
            codigoUsado: codigo,
        });

        tx.set(indiceRef, {
            rol: 'admin',
            nombre: datos.nombreEmpresa,
            activo: true,
            fechaIngreso: serverTimestamp(),
            codigoUsado: codigo,
        });

        tx.update(codigoRef, {
            usado: true,
            usadoPor: user.uid,
            fechaUso: serverTimestamp(),
            empresaCreada: empresaId,
        });

        return empresaId;
    });
}

async function canjearUnirse(empresaId, codigo, user, nombre) {
    const codigoRef = doc(db, 'empresas', empresaId, 'codigosInvitacion', codigo);

    return runTransaction(db, async (tx) => {
        const codigoSnap = await tx.get(codigoRef);
        if (!codigoSnap.exists()) throw new Error('Código inválido.');
        const datos = codigoSnap.data();
        if (datos.usado) throw new Error('Este código ya fue usado.');

        const miembroRef = doc(db, 'empresas', empresaId, 'miembros', user.uid);
        const indiceRef = doc(db, 'users', user.uid, 'empresas', empresaId);

        tx.set(miembroRef, {
            nombre,
            rol: datos.rolAsignado || 'usuario',
            activo: true,
            fechaIngreso: serverTimestamp(),
            codigoUsado: codigo,
        });

        tx.set(indiceRef, {
            rol: datos.rolAsignado || 'usuario',
            nombre: datos.nombreEmpresa,
            activo: true,
            fechaIngreso: serverTimestamp(),
            codigoUsado: codigo,
        });

        tx.update(codigoRef, {
            usado: true,
            usadoPor: user.uid,
            fechaUso: serverTimestamp(),
        });

        return empresaId;
    });
}

/**
 * Punto de entrada único desde el form de "ingresar código". Detecta el
 * tipo por la forma del texto: si tiene un "-", es compuesto (unirse a
 * una empresa existente); si no, es un código pelado (crear empresa).
 * Devuelve el empresaId resultante, para poder redirigir ahí.
 */
export async function canjearCodigo(codigoInput, user, nombre) {
    const texto = codigoInput.trim();
    if (!texto) throw new Error('Ingresá un código.');

    const separador = texto.lastIndexOf('-');
    if (separador > 0) {
        const empresaId = texto.slice(0, separador);
        const codigo = texto.slice(separador + 1).toUpperCase();
        return canjearUnirse(empresaId, codigo, user, nombre);
    }

    return canjearCrearEmpresa(texto.toUpperCase(), user, nombre);
}
