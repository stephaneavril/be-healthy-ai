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

    // Nuevo prompt basado en las imágenes de referencia
    const finalPrompt = `
    Una ilustración digital colorida y optimista que representa un estilo de vida saludable y activo. 
    La escena debe ser inspiradora y mostrar una combinación de elementos saludables en un diseño moderno y armonioso.

    **Elementos Clave:**
    - Un grupo de personas felices realizando actividades saludables en un entorno amigable.
    - **Alimentación:** ${respuestas[0]}, representado de manera clara y atractiva (ejemplo: frutas, ensaladas, alimentos frescos).
    - **Ejercicio:** ${respuestas[1]}, mostrado de manera dinámica (ejemplo: corriendo, haciendo yoga, levantando pesas).
    - **Bienestar mental:** ${respuestas[2]}, con posturas relajadas o actividades como meditación.
    - **Descanso:** ${respuestas[3]}, en un contexto pacífico (ejemplo: descanso en la naturaleza, momentos de relajación).

    **Estilo Visual:**
    - Ilustración en vector art, con colores brillantes y armoniosos.
    - Fondos suaves y composiciones bien equilibradas.
    - Elementos bien definidos, sin distorsiones ni abstracciones extrañas.
    - Un solo cuadro, sin collage ni múltiples imágenes.

    **Objetivo:**
    La imagen debe inspirar hábitos saludables y bienestar, con un enfoque motivacional y aspiracional.
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
