import { useRosco } from "../../hooks/useRosco";

import Temporizador from "./components/Temporizador";
import CirculoLetras from "./components/CirculoLetras";
import PreguntaActual from "./components/PreguntaActual";
import BotonesJuego from "./components/BotonesJuego";

export default function Rosco(){
    const{
        iniciado,
        preguntas,
        actual,
        indice,
        tiempo,
        pausado,
        terminado,
        correctas,
        incorrectas,
        marcar,
        avanzar,
        reiniciarJuego
    }=useRosco();


return (

    <div className="pantalla-rosco">

        <Temporizador tiempo={tiempo}/>

        <CirculoLetras
            preguntas={preguntas}
            indice={indice}
            iniciado={iniciado}
            terminado={terminado}
            reiniciarJuego={reiniciarJuego}
        />

        {
            iniciado && !terminado && (
                <>
                    <PreguntaActual pregunta={actual}/>

                    <BotonesJuego
                        marcar={marcar}
                        avanzar={avanzar}
                        pausado={pausado}
                    />
                </>
            )
        }

        {
            terminado && (
                <>
                    <h2>Fin del juego</h2>

                    <p>Correctas: {correctas}</p>

                    <button onClick={reiniciarJuego}>
                        🔄 Jugar nuevamente
                    </button>
                </>
            )
        }

    </div>
)}