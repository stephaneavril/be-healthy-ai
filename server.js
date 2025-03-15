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

    const finalPrompt = `✨ Ilustración digital de alta calidad que representa un **estilo de vida saludable y equilibrado** con una composición armoniosa y estéticamente agradable.

🔹 **Escena principal:** Un individuo radiante, feliz y lleno de vitalidad en un entorno natural y acogedor.
🔹 **Colores:** Tonos cálidos y relajantes que transmiten bienestar, sin elementos caóticos ni saturados.
🔹 **Elementos integrados sutilmente según las respuestas del usuario:**
   - 🍏 **Alimentación:** ${respuestas[0]} - Representado de manera realista, como una fruta fresca en la mano o en una mesa de desayuno soleada.
   - 💪 **Ejercicio:** ${respuestas[1]} - La persona en la imagen muestra vitalidad y energía, con una postura segura y empoderada.
   - 🧘‍♂️ **Salud Mental:** ${respuestas[2]} - Expresión facial relajada, con una sensación de calma y equilibrio en la escena.
   - 😴 **Descanso:** ${respuestas[3]} - Sugiere un ambiente de paz, con luz cálida, un entorno fresco y una sensación de recuperación.

🖌 **Estilo de la imagen:**  
Debe parecer una pintura digital realista o ilustración inspiradora con un **único sujeto central**.  
Evitar formas abstractas, imágenes deformadas o composiciones caóticas.

🚀 **Resultado esperado:**  
Una **imagen única y motivacional** que transmita paz, equilibrio y bienestar, con una persona feliz disfrutando de su vida saludable en un entorno positivo.`;

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
