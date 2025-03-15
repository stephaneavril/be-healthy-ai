require('dotenv').config();
const express = require("express");
const cors = require("cors");
const Replicate = require("replicate");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Sirve archivos estáticos de la carpeta "frontend"
app.use(express.static("frontend"));

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
});

// Ruta POST para generar imagen
app.post("/generate", async (req, res) => {
  try {
    const { respuestas, prompt } = req.body;
    let finalPrompt = prompt;
    if (!finalPrompt) {
      if (!respuestas || respuestas.length < 4) {
        return res.status(400).json({ error: "Se requieren 4 respuestas para generar la imagen" });
      }
      finalPrompt = `Crea una imagen motivacional basada en estos aspectos de bienestar: 
      - Alimentación: ${respuestas[0]}
      - Actividad física: ${respuestas[1]}
      - Salud mental: ${respuestas[2]}
      - Descanso: ${respuestas[3]}`;
    }

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

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
