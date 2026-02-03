import { useEffect, useState } from "react";

export function User() {
    // funciones timer

    return (
        <div>
            <p>Bienvenido al panel de usuario. Aquí puedes ver y gestionar tu información personal.</p>
            {/* Agrega más funcionalidades de usuario según sea necesario */}
            <div
                
                style={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    background: isRunning ? "#e74c3c" : "#2ecc71",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 40,
                    cursor: "pointer",
                    color: "#fff",
                    userSelect: "none",
                    margin: "20px auto",
                }}
            >
                {isRunning ? "⏸" : "▶️"}
            </div>

            {/* CONTADOR */}
            <h2>{formatTime(elapsed)}</h2>
        </div>
    );
}

const STORAGE_KEY = "work_timer";

export const Timer = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [elapsed, setElapsed] = useState(0); // ms

    // 🔄 cargar estado si estaba corriendo
    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (saved?.isRunning && saved?.startTime) {
            setIsRunning(true);
            setStartTime(saved.startTime);
            setElapsed(Date.now() - saved.startTime);
        }
    }, []);

    // ⏱️ contador visual
    useEffect(() => {
        let interval = null;

        if (isRunning) {
            interval = setInterval(() => {
                setElapsed(Date.now() - startTime);
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isRunning, startTime]);

    // ▶️ iniciar
    const startTimer = () => {
        const now = Date.now();
        setIsRunning(true);
        setStartTime(now);
        setElapsed(0);

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                isRunning: true,
                startTime: now,
            })
        );
    };

    // ⏸ detener
    const stopTimer = () => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        setIsRunning(false);
        setStartTime(null);
        setElapsed(0);

        localStorage.removeItem(STORAGE_KEY);

        // 🔥 ACÁ guardás en DB cuando haya internet
        console.log("Duración real (ms):", duration);
        console.log("Horas:", duration / 1000 / 60 / 60);
    };

    const toggleTimer = () => {
        isRunning ? stopTimer() : startTimer();
    };

    return (
        <div style={{ textAlign: "center" }}>
            {/* CÍRCULO */}
            <div
                onClick={toggleTimer}
                style={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    background: isRunning ? "#e74c3c" : "#2ecc71",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 40,
                    cursor: "pointer",
                    color: "#fff",
                    userSelect: "none",
                }}
            >
                {isRunning ? "⏸" : "▶️"}
            </div>

            {/* CONTADOR */}
            <h2>{formatTime(elapsed)}</h2>
        </div>
    );
};


const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
    )}:${String(seconds).padStart(2, "0")}`;
};