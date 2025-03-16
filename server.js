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
    Obra de arte digital inspiradora con un estilo artístico detallado.
    La imagen representa a una persona en un estado de bienestar y equilibrio.
    
    **Elementos clave según las respuestas del usuario:**
    - **Alimentación:** ${respuestas[0]} (Ejemplo: fruta fresca sobre una mesa iluminada por la luz del sol).
    - **Ejercicio:** ${respuestas[1]} (Ejemplo: persona haciendo yoga en un entorno natural armonioso).
    - **Salud Mental:** ${respuestas[2]} (Ejemplo: expresión facial de calma, ambiente de relajación).
    - **Descanso:** ${respuestas[3]} (Ejemplo: una escena serena con colores suaves y cálidos).
    
    **Características del arte:**
    - Estilo digital con detalles artísticos inspiradores.
    - Colores suaves y cálidos que transmitan tranquilidad.
    - Composición bien equilibrada, sin deformaciones.
    - Inspirado en la energía del bienestar y la paz mental.
    
    **Debe generar una sola imagen con todos estos elementos en una composición armoniosa.**
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
const host = '0.0.0.0';

app.listen(port, host, () => {
    console.log(`🚀 Servidor corriendo en http://${host}:${port}`);
});
