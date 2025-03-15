document.getElementById("imageForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const respuestas = [
        document.getElementById("alimentacion").value,
        document.getElementById("actividad").value,
        document.getElementById("salud").value,
        document.getElementById("descanso").value
    ];

    const response = await fetch("https://be-healthy-ai-production.up.railway.app/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ respuestas })
    });

    const data = await response.json();

    if (data.image_url) {
        document.getElementById("imageOutput").src = data.image_url;
        document.getElementById("imageOutput").style.display = "block";
    } else {
        alert("Hubo un error al generar la imagen.");
    }
});
