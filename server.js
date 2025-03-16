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
      Una ilustración digital en estilo vectorial, con colores vivos y líneas limpias, que represente hábitos de vida saludable de manera educativa y atractiva.
      La imagen debe incluir:
      - Un fondo blanco o claro, con iconos y elementos ilustrativos bien organizados.
      - Una composición visual atractiva con personas en diferentes actividades saludables.
      - **Elementos basados en las respuestas del usuario:**
        - Alimentación: ${respuestas[0]}, representado con frutas, verduras o platos saludables.
        - Ejercicio: ${respuestas[1]}, con una persona haciendo la actividad indicada (por ejemplo, yoga, ciclismo, correr).
        - Salud Mental: ${respuestas[2]}, mostrando relajación o meditación.
        - Descanso: ${respuestas[3]}, en un ambiente que refleje bienestar y recuperación.

      **Estilo de la imagen:**
      - **Vectorial y educativo**, similar a infografías de bienestar.
      - **Colores vibrantes**, combinando tonos azules, verdes y naranjas.
      - **Diseño claro y bien estructurado**, sin elementos abstractos ni distorsionados.

      **Resultado esperado:**
      - **UNA SOLA IMAGEN** con una composición balanceada.
      - **Personas realizando actividades saludables** con expresiones alegres y motivadoras.
      - **Un mensaje visual claro de bienestar y equilibrio**.

      La imagen debe ser perfecta para ser usada en materiales educativos o promocionales.
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
