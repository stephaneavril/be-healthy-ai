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

    const finalPrompt = `Una ilustración digital inspiradora y motivacional que represente un estilo de vida equilibrado y feliz. 
    La imagen debe mostrar un ambiente armonioso con colores suaves y naturales, reflejando **paz, bienestar y alegría**. 
    
    🎨 **Concepto**:
    Se debe visualizar **una persona radiante y feliz** disfrutando de su bienestar, rodeada de un entorno positivo. 
    Cada elemento debe integrarse de manera fluida en la escena para transmitir una sensación de plenitud.
    
    ✨ **Elementos Clave**:
    - **Alimentación:** ${respuestas[0]} - Representado por una comida balanceada y apetitosa en la escena.
    - **Actividad Física:** ${respuestas[1]} - Expresado a través de una postura activa y enérgica, como yoga, caminata o estiramientos.
    - **Salud Mental:** ${respuestas[2]} - Reflejado con una expresión relajada y un fondo sereno que inspire calma.
    - **Descanso:** ${respuestas[3]} - Sugiere una atmósfera acogedora y reparadora, con luz cálida y elementos que evocan tranquilidad.
    
    🚀 **Requisitos Técnicos**:
    - **UNA SOLA IMAGEN**, sin collage ni elementos superpuestos.
    - **Colores cálidos y naturales**, evitando tonos caóticos.
    - **Estética profesional y realista**, sin deformaciones.
    - **Sensación de armonía**, evitando elementos dispersos o confusos.
    
    📌 La imagen final debe evocar **motivación, bienestar y alegría**, ideal para inspirar a las personas a mejorar su calidad de vida.`;
    
    

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
