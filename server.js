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

    const finalPrompt = `
    Una ilustración digital realista que representa un estilo de vida saludable y equilibrado.
    La imagen debe transmitir bienestar, motivación y alegría.

    **Características clave:**
    - **Persona feliz y radiante** en un entorno natural armonioso.
    - **Colores cálidos y relajantes** que transmitan paz y bienestar.
    - **Elementos clave** basados en las respuestas del usuario:
      - **Alimentación:** ${respuestas[0]} (ejemplo: frutas frescas sobre una mesa soleada).
      - **Ejercicio:** ${respuestas[1]} (persona enérgica en movimiento).
      - **Salud Mental:** ${respuestas[2]} (expresión de calma y equilibrio).
      - **Descanso:** ${respuestas[3]} (ambiente sereno y reconfortante).

    **Requisitos Técnicos:**
    - UNA SOLA IMAGEN clara y estética (NO collage).
    - Sin deformaciones ni elementos extraños.
    - Estilo ilustración realista y motivacional.
    - Composición armoniosa y bien equilibrada.

    La imagen debe inspirar a las personas a mejorar su bienestar y disfrutar de una vida sana y equilibrada.
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
