export default function PreguntaActual({ pregunta }) {
    if(!pregunta) return null;
    return(
        <div className="pregunta-actual">
            <h2>
                Letra {pregunta.letra} - R: {pregunta.respuesta}
            </h2>
            <p>
                {pregunta.pregunta}
            </p>
        </div>
    );
}