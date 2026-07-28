export default function BotonesJuego({
    marcar,
    avanzar,
    pausado
}){

    return(
        <div className="botones-juego">
            {
                !pausado ?
                <>
                    <button

                        onClick={()=>marcar("correcto")}
                    >
                        Correcto
                    </button>

                    <button
                        onClick={()=>marcar("incorrecto")}
                    >
                        Incorrecto
                    </button>

                    <button
                        onClick={()=>marcar("pendiente")}
                    >
                        Pasapalabra
                    </button>
                </>
                :
                <button
                    onClick={avanzar}
                >
                    Siguiente
                </button>
            }
        </div>
    );
}