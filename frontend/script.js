document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("generarBtn").addEventListener("click", generarImagen);
    document.getElementById("imprimirBtn").addEventListener("click", imprimirImagen);
});

async function generarImagen() {
    document.getElementById("status").innerText = "Generando imagen...";
    
    // Obtiene los valores de los inputs
    const input1 = document.getElementById("input1");
    const input2 = document.getElementById("input2");
    const input3 = document.getElementById("input3");
    const input4 = document.getElementById("input4");

    // Verifica si los inputs existen
    if (!input1 || !input2 || !input3 || !input4) {
        console.error("Uno o más campos de entrada no se encontraron en el DOM.");
        return;
    }

    const respuestas = [
        input1.value.trim(),
        input2.value.trim(),
        input3.value.trim(),
        input4.value.trim()
    ];

    // Verifica si los valores están vacíos
    if (respuestas.some(r => r === "")) {
        alert("Todos los campos son obligatorios.");
        document.getElementById("status").innerText = "❌ Por favor, completa todos los campos.";
        return;
    }

    try {
        const response = await fetch("/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ respuestas })
        });

        const data = await response.json();
        if (data.image_url) {
            document.getElementById("outputImage").src = data.image_url;
            document.getElementById("status").innerText = "✅ Imagen generada con éxito";
        } else {
            throw new Error("No se pudo obtener la imagen");
        }
    } catch (error) {
        console.error("Error generando la imagen:", error);
        document.getElementById("status").innerText = "❌ Error generando la imagen";
    }
}

function imprimirImagen() {
    const imageUrl = document.getElementById("outputImage").src;
    if (imageUrl) {
        const printWindow = window.open("");
        printWindow.document.write(`<img src="${imageUrl}" style="width:100%">`);
        printWindow.document.close();
        printWindow.print();
    } else {
        alert("No hay imagen generada para imprimir.");
    }
}
