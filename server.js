require('dotenv').config();
const express = require("express");
const cors = require("cors");
const Replicate = require("replicate");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, "frontend")));

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
});

// Ruta POST para generar imagen
app.post("/generate", async (req, res) => {
  try {
    const { respuestas } = req.body;

    if (!respuestas || respuestas.length < 4) {
      return res.status(400).json({ error: "Se requieren 4 respuestas para generar la imagen" });
    }

    // Construcción dinámica del prompt asegurando coherencia visual
    const finalPrompt = `
    Una ilustración digital ultra realista, inspiradora y motivacional que represente un estilo de vida saludable y equilibrado.
    
    📌 **Composición visual:**
    - Un individuo radiante, enérgico y feliz, reflejando un estado de bienestar total.
    - La imagen debe tener una estética **cálida, armoniosa y positiva**.
    - Escena en un entorno natural o en un espacio sereno y reconfortante.
    
    📌 **Elementos clave a incluir según las respuestas:**
    - Alimentación: **${respuestas[0]}** representado de forma visualmente atractiva, como un tazón de frutas frescas o un desayuno equilibrado.
    - Actividad física: **${respuestas[1]}**, ilustrando a la persona en movimiento o en una postura activa.
    - Salud mental: **${respuestas[2]}**, expresado en una actitud de calma, meditación o alegría genuina.
    - Descanso: **${respuestas[3]}**, con un ambiente que sugiera tranquilidad, relajación y renovación.

    📌 **Estilo de la ilustración:**
    - Imagen **única**, sin collage ni elementos dispersos.
    - **Composición bien equilibrada**, con un foco claro y sin elementos abstractos.
    - Estilo cinematográfico con iluminación natural, evitando tonos artificiales o contrastes caóticos.
    - **Rostros detallados y expresivos**, reflejando alegría, paz y vitalidad.

    📌 **Resultado esperado:**
    Una **imagen de alta calidad**, inspiradora y motivacional, que cualquier persona pueda identificar como un reflejo positivo de su bienestar.
    `;

    console.log(`Generando imagen para: "${finalPrompt}"`);

    const prediction = await replicate.predictions.create({
      version: "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
      input: { prompt: finalPrompt }
    });

    if (!prediction || !prediction.id) {
      return res.status(500).json({ error: "No se pudo iniciar la predicción en Replicate" });
    }

    let status = prediction.status;
    let imageUrl = null;

    while (status !== "succeeded" && status !== "failed") {
      console.log(`Estado: ${status}, esperando...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      const updatedPrediction = await replicate.predictions.get(prediction.id);
      status = updatedPrediction.status;
      if (status === "succeeded" && updatedPrediction.output && updatedPrediction.output.length > 0) {
        imageUrl = updatedPrediction.output[0];
        break;
      }
    }

    if (!imageUrl) {
      return res.status(500).json({ error: "No se recibió la imagen" });
    }

    console.log("Imagen generada:", imageUrl);
    res.json({ image_url: imageUrl });
  } catch (error) {
    console.error("Error interno:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Configuración de puerto y host para Railway
const port = process.env.PORT || 8080;
const host = '0.0.0.0';  // IMPORTANTE para Railway

app.listen(port, host, () => {
    console.log(`🚀 Servidor corriendo en http://${host}:${port}`);
});
