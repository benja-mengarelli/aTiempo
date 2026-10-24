import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function Modal({ titulo, cerrar, grande = false, children }) {
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && cerrar();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [cerrar]);

    return createPortal(
        <div className="modal-fondo" onClick={cerrar}>
            <div className={`modal ${grande ? "modal-grande" : ""}`} role="dialog" aria-modal="true"
                aria-label={titulo} onClick={(e) => e.stopPropagation()}>
                <h3>{titulo}</h3>
                {children}
            </div>
        </div>,
        document.body
    );
}