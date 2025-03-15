document.getElementById("formulario").addEventListener("submit", async function(event) {
    event.preventDefault();

    const respuestas = [
        document.getElementById("respuesta1").value,
        document.getElementById("respuesta2").value,
        document.getElementById("respuesta3").value,
        document.getElementById("respuesta4").value
    ];

    // Mostrar mensaje de espera
    document.getElementById("imagen").style.display = "none";
    document.getElementById("imagen").alt = "Generando imagen...";

    try {
        const response = await fetch("http://localhost:3000/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ respuestas })
        });

        const data = await response.json();

        if (data.image_url) {
