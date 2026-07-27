export default function GraficoCard({ titulo, children }) {
    return (
        <section className="grafico-card">

            <div className="grafico-header">
                <h2>{titulo}</h2>
            </div>

            <div className="grafico-body">
                {children}
            </div>

        </section>
    );
}