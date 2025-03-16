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

    // Construcción del prompt más preciso
    const finalPrompt = `
      Una ilustración digital moderna y minimalista que representa hábitos de bienestar y salud. 
      La imagen debe ser clara, motivacional y con una composición equilibrada.

      🎨 **Características clave:**
      - Estilo **vectorial plano** (flat design), similar a infografías modernas.
      - **Colores vibrantes y organizados** en tonos cálidos y naturales.
      - **Elementos bien alineados**, sin composiciones desordenadas ni superposiciones extrañas.
      - **Sin texto ni palabras generadas automáticamente.**
      
      🔹 **Elementos incluidos según respuestas del usuario:**
      - **Alimentación:** ${respuestas[0]} representado con frutas frescas, platos saludables o jugos naturales.
      - **Ejercicio:** ${respuestas[1]} representado con personas corriendo, en bicicleta o haciendo yoga.
      - **Salud Mental:** ${respuestas[2]} representado con una persona en estado de meditación o tranquilidad.
      - **Descanso:** ${respuestas[3]} representado con un ambiente relajante, como una persona descansando plácidamente.

      🌿 **Formato y estilo:**
      - **UNA SOLA IMAGEN en alta calidad.**
      - **Diseño limpio, sin ruido visual.**
      - **Claridad y armonía en la composición.**
      - **Evitar formas abstractas o deformaciones.**
      
      ✨ La imagen final debe reflejar un **estilo de vida saludable y armonioso**, ideal para inspirar a las personas a mejorar su bienestar.
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
