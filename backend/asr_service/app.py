from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from transformers import WhisperProcessor, WhisperForConditionalGeneration
import torch, io, numpy as np
from pydub import AudioSegment

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://speechrec.aynproject.com"],
    allow_methods=["POST"],
    allow_headers=["*"],
)

processor = WhisperProcessor.from_pretrained("openai/whisper-large-v3")
model = WhisperForConditionalGeneration.from_pretrained(
    "openai/whisper-large-v3"
).to(device)

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    audio_bytes = await file.read()
    seg = AudioSegment.from_file(io.BytesIO(audio_bytes), format="webm")
    seg = seg.set_frame_rate(16_000).set_channels(1)
    samples = np.array(seg.get_array_of_samples()).astype(np.float32) / 32768.0

    inputs = processor(samples, sampling_rate=16_000, return_tensors="pt")
    input_features = inputs.input_features.to(device)
    predicted_ids = model.generate(input_features)
    transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]

    return {"text": transcription}
