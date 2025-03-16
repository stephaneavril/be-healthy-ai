document.getElementById("generateButton").addEventListener("click", async function() {
    const alimentacion = document.getElementById("alimentacion").value;
    const ejercicio = document.getElementById("ejercicio").value;
    const saludMental = document.getElementById("saludMental").value;
    const descanso = document.getElementById("descanso").value;

    if (!alimentacion || !ejercicio || !saludMental || !descanso) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    const statusMessage = document.getElementById("statusMessage");
    const generatedImage = document.getElementById("generatedImage");
    const printButton = document.getElementById("printButton");

    statusMessage.innerText = "Generando imagen... ⏳";
    generatedImage.style.display = "none";
    printButton.style.display = "none";

    try {
        const response = await fetch("/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ respuestas: [alimentacion, ejercicio, saludMental, descanso] })
        });

        const data = await response.json();

        if (data.image_url) {
            statusMessage.innerText = "Imagen generada con éxito ✅";
            generatedImage.src = data.image_url;
            generatedImage.style.display = "block";
            printButton.style.display = "inline-block";
        } else {
            statusMessage.innerText = "Error al generar la imagen ❌";
        }
    } catch (error) {
        console.error("Error:", error);
        statusMessage.innerText = "Error en la solicitud ❌";
    }
});

document.getElementById("printButton").addEventListener("click", function() {
    const image = document.getElementById("generatedImage");
    if (image) {
        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
            <html>
            <head><title>Imprimir Imagen</title></head>
            <body style="text-align:center;">
                <img src="${image.src}" style="width:100%; max-width:800px;">
                <script>window.onload = function() { window.print(); }<\/script>
            </body>
            </html>
        `);
        printWindow.document.close();
    } else {
        alert("No hay imagen para imprimir.");
    }
});
