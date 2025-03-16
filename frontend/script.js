function generarImagen() {
    const respuestas = [
        document.getElementById("resp1").value,
        document.getElementById("resp2").value,
        document.getElementById("resp3").value,
        document.getElementById("resp4").value
    ];

    if (respuestas.some(r => r.trim() === "")) {
        alert("Por favor completa todas las respuestas antes de generar la imagen.");
        return;
    }

    document.getElementById("statusMessage").style.display = "block";

    fetch("/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ respuestas }),
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("statusMessage").style.display = "none";

        if (data.image_url) {
            const imageElement = document.getElementById("generatedImage");
            imageElement.src = data.image_url;
            imageElement.style.display = "block";

            const printButton = document.getElementById("printButton");
            printButton.style.display = "block";
        } else {
            alert("Error al generar la imagen. Inténtalo de nuevo.");
        }
    })
    .catch(error => {
        document.getElementById("statusMessage").style.display = "none";
        console.error("Error:", error);
        alert("Error en la conexión con el servidor.");
    });
}

function printImage() {
    const imageUrl = document.getElementById("generatedImage").src;
    if (!imageUrl) {
        alert("No hay imagen para imprimir.");
        return;
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Impresión de Imagen</title>
                <style>
                    body { text-align: center; font-family: Arial, sans-serif; }
                    img { max-width: 100%; height: auto; margin: 20px; }
                </style>
            </head>
            <body>
                <h2>Imagen Motivacional</h2>
                <img src="${imageUrl}" />
                <script>
                    window.onload = function() {
                        window.print();
                    };
                </script>
            </body>
        </html>
    `);
    printWindow.document.close();
}
