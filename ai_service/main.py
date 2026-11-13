import base64
import binascii
import io
from pathlib import Path

import numpy as np
import tensorflow as tf
from fastapi import FastAPI, HTTPException
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel


MODEL_PATH = Path(__file__).parent / "model" / "modelo_lichia.keras"
MAX_IMAGE_BYTES = 8 * 1024 * 1024

if not MODEL_PATH.is_file():
    raise RuntimeError(f"Modelo Keras não encontrado: {MODEL_PATH}")

model = tf.keras.models.load_model(MODEL_PATH, compile=False)
app = FastAPI(title="Mobo Ripeness AI")


class CameraFrameRequest(BaseModel):
    image_base64: str
    mime_type: str = "image/jpeg"
    file_name: str = "camera.jpg"


def predict_image(image: Image.Image) -> tuple[str, float]:
    image = image.convert("RGB").resize((224, 224))
    image_array = np.asarray(image, dtype=np.float32) / 255.0
    prediction = float(model.predict(np.expand_dims(image_array, axis=0), verbose=0)[0][0])

    if prediction >= 0.5:
        return "nao_madura", prediction
    return "madura", 1 - prediction


@app.get("/health")
def health():
    return {"status": "online", "modelo": "carregado"}


@app.post("/predict-frame")
def predict_frame(frame: CameraFrameRequest):
    if frame.mime_type not in {"image/jpeg", "image/jpg", "image/png"}:
        raise HTTPException(status_code=400, detail="Envie uma imagem JPG, JPEG ou PNG.")

    if len(frame.image_base64) > 12 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="A imagem deve ter no máximo 8 MB.")

    try:
        image_bytes = base64.b64decode(frame.image_base64, validate=True)
        if not image_bytes or len(image_bytes) > MAX_IMAGE_BYTES:
            raise HTTPException(status_code=413, detail="A imagem deve ter no máximo 8 MB.")

        image = Image.open(io.BytesIO(image_bytes))
        predicted_class, confidence = predict_image(image)
    except HTTPException:
        raise
    except (binascii.Error, ValueError, UnidentifiedImageError) as error:
        raise HTTPException(status_code=400, detail="O quadro recebido não é uma imagem válida.") from error
    except Exception as error:
        raise HTTPException(status_code=500, detail="Falha ao executar o modelo de maturação.") from error

    return {
        "classe_prevista": predicted_class,
        "confianca": round(confidence * 100, 2),
        "nome_arquivo": Path(frame.file_name).name[:120],
    }
