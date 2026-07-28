export default function CirculoLetras({
    preguntas,
    indice,
    iniciado,
    terminado,
    reiniciarJuego
}) {

    const size = window.innerWidth < 600 ? 300 : 420;
    const radio = size / 2 - 25;
    const centro = size / 2;

    return (
        <div
            className="circulo"
        >

            {
                preguntas.map((p, i) => {
                    const angulo =
                        (2 * Math.PI * i) / preguntas.length;

                    const x =
                        Math.cos(angulo) * radio + centro;

                    const y =
                        Math.sin(angulo) * radio + centro;

                    return (
                        <div
                            key={p.letra}

                            className={
                                `letter
                                ${p.estado}
                                ${i === indice ? "activa" : ""}`
                            }
                            style={{
                                left: x,
                                top: y
                            }}
                        >
                            {p.letra}
                        </div>
                    );
                })
            }
            <button
                className="btn-centro"
                onClick={() => {
                    if (!iniciado || terminado) {
                        reiniciarJuego();
                    }
                }}
            >
                {
                    !iniciado
                        ? "▶ Comenzar"
                        : "🔄 Reiniciar"
                }
            </button>
        </div>
    );
}