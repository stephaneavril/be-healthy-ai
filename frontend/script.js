document.getElementById("formulario").addEventListener("submit", async function(event) {
    event.preventDefault();
    const respuestas = [
        document.getElementById("respuesta1").value,
        document.getElementById("respuesta2").value,
        document.getElementById("respuesta3").value,
        document.getElementById("respuesta4").value
    ];
    document.getElementById("imagen").style.display = "none";
    document.getElementById("imagen").alt = "Generando imagen...";
    try {
        const response = await fetch("/generate", {  // nota: ruta relativa
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ respuestas })
        });
        const data = await response.json();
        if (data.image_url) {
            document.getElementById("imagen").src = data.image_url;
            document.getElementById("imagen").style.display = "block";
        } else {
            alert("Error al generar la imagen.");
        }
    } catch (error) {
        console.error("Error en la solicitud:", error);
        alert("Error en la conexión con el servidor.");
    }
});
