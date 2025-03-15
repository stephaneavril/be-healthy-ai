async function generarImagen() {
    const respuestas = [
        document.getElementById("alimentacion").value,
        document.getElementById("actividad").value,
        document.getElementById("salud").value,
        document.getElementById("descanso").value
    ];

    if (respuestas.some(r => r.trim() === "")) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    document.getElementById("mensaje").textContent = "Generando imagen... ⏳";
    
    try {
        const response = await fetch("/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ respuestas })
        });

        const data = await response.json();

        if (data.image_url) {
            document.getElementById("imagenGenerada").src = data.image_url;
            document.getElementById("imagenGenerada").style.display = "block";
            document.getElementById("mensaje").textContent = "Imagen generada con éxito ✅";
        } else {
            document.getElementById("mensaje").textContent = "Error generando la imagen ❌";
        }
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("mensaje").textContent = "Error en el servidor ❌";
    }
}
