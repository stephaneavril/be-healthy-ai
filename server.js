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
    📌 **Descripción General:**  
    Una imagen digital **hiperrealista y vibrante** que representa un estilo de vida saludable y equilibrado.  
    Debe evocar **motivación, bienestar y felicidad**, con una composición armoniosa y estética.

    ✅ **Escena Principal:**  
    Un individuo radiante, lleno de vitalidad, disfrutando de un entorno natural y acogedor.  
    Expresión de **alegría y paz interior**, con una postura empoderada.

    🌿 **Elementos Clave según las respuestas del usuario:**  
    - **Nutrición:** ${respuestas[0]} (ejemplo: manzana jugosa en la mano, smoothie nutritivo sobre una mesa soleada).  
    - **Ejercicio:** ${respuestas[1]} (ejemplo: persona haciendo yoga con fondo de montaña, entrenamiento en un parque).  
    - **Salud Mental:** ${respuestas[2]} (ejemplo: postura relajada, meditación con luz suave al amanecer).  
    - **Descanso:** ${respuestas[3]} (ejemplo: ambiente de tranquilidad, luz cálida de atardecer, expresión serena).

    🎨 **Estilo Visual y Técnicas Artísticas:**  
    - **Arte digital fotorrealista,** inspirado en las mejores ilustraciones de Leonardo.Ai.  
    - **Iluminación cinematográfica,** con un brillo natural y sombras suaves.  
    - **Colores cálidos y vibrantes,** transmitiendo armonía y energía positiva.  
    - **Detalles en alta resolución,** piel suave, texturas ricas, reflejos naturales.  

    ⚠ **Instrucciones Claves para la IA:**  
    - ❌ NO generar imágenes abstractas ni elementos extraños.  
    - ❌ NO crear collage ni composiciones caóticas.  
    - ✅ **UNA SOLA IMAGEN**, sin deformaciones ni errores anatómicos.  
    - ✅ **Aspecto natural y humano, sin exageraciones o poses artificiales.**  
    - ✅ **Equilibrio entre arte digital y realismo.**

    🎯 **Resultado Esperado:**  
    Una imagen que inspire a las personas a adoptar hábitos saludables, mostrando un estilo de vida **pleno y en equilibrio.**
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
