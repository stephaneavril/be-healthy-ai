document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("generarBtn").addEventListener("click", generarImagen);
    document.getElementById("imprimirBtn").addEventListener("click", imprimirImagen);
});

async function generarImagen() {
    const respuestas = [
        document.getElementById("alimentacion").value,
        document.getElementById("ejercicio").value,
        document.getElementById("mental").value,
        document.getElementById("descanso").value
    ];

    if (!respuestas.every(respuesta => respuesta.trim() !== "")) {
        alert("Por favor, llena todos los campos antes de generar la imagen.");
        return;
    }

    document.getElementById("resultado").innerHTML = "Generando imagen... ⏳";

    try {
        const response = await fetch("/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ respuestas })
        });

        const data = await response.json();

        if (data.image_url) {
            document.getElementById("resultado").innerHTML = `
                <p>Imagen generada con éxito ✅</p>
                <img id="imagenGenerada" src="${data.image_url}" alt="Imagen de Bienestar">
            `;
        } else {
            document.getElementById("resultado").innerHTML = "<p>Error al generar la imagen ❌</p>";
        }
    } catch (error) {
        console.error("Error en la generación de la imagen:", error);
        document.getElementById("resultado").innerHTML = "<p>Ocurrió un error. Inténtalo de nuevo.</p>";
    }
}

function imprimirImagen() {
    const imagen = document.getElementById("imagenGenerada");
    if (imagen) {
        const ventana = window.open("", "_blank");
        ventana.document.write(`<img src="${imagen.src}" style="width:100%;">`);
        ventana.document.write("<script>window.print();<\/script>");
        ventana.document.close();
    } else {
        alert("Genera una imagen primero.");
    }
}
