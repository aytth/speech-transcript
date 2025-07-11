from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from transformers import WhisperProcessor, WhisperForConditionalGeneration

import torch
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://speechrec\.aynproject\.com",
    allow_methods=["POST"],
    allow_headers=["*"],
)

processor = WhisperProcessor.from_pretrained("openai/whisper-large-v3")
model = WhisperForConditionalGeneration.from_pretrained(
    "openai/whisper-large-v3"
).to(device)

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    audio = await file.read()
    inputs = processor(audio, sampling_rate=16_000, return_tensors="pt")
    input_features = inputs.input_features.to("cuda")
    predicted_ids = model.generate(input_features)
    transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
    return {"text": transcription}