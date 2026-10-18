"""Prueba pequeña de Whisper en local (faster-whisper, CPU, int8) con voz en español.

Uso: python prueba-whisper.py <carpeta_con_clips>
La carpeta debe tener clips.json (lista de {file, ref, dur}) con clipNN.wav (limpio)
y noisyNN.wav (mismo audio + ruido rosa sintético a SNR 5 dB).
Clips: Multilingual LibriSpeech (facebook/multilingual_librispeech, config spanish,
split test, CC BY 4.0), 10 hablantes distintos, descargados del datasets-server de
Hugging Face el 18-10-2026. El audio no se guarda en el repositorio.
"""
import json, os, sys, time, unicodedata, re, wave
import numpy as np
from faster_whisper import WhisperModel
import jiwer

def load_wav(fn):
    # WAV 16 kHz mono 16 bits -> float32 (evita depender de PyAV)
    with wave.open(fn) as w:
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0

def norm(t):
    t = unicodedata.normalize("NFD", t.lower())
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")  # quita tildes
    t = re.sub(r"[^a-zñ0-9 ]+", " ", t)
    return re.sub(r"\s+", " ", t).strip()

d = sys.argv[1]
clips = json.load(open(os.path.join(d, "clips.json")))
total = sum(c["dur"] for c in clips)
models = sys.argv[2:] or ["tiny", "base", "small", "large-v3-turbo"]
print(f"CPU: {os.cpu_count()} hilos; audio: {len(clips)} clips, {total:.0f} s")
for m in models:
    t0 = time.time()
    model = WhisperModel(m, device="cpu", compute_type="int8", cpu_threads=os.cpu_count())
    load = time.time() - t0
    for kind, prefix in (("limpio", "clip"), ("ruido 5 dB", "noisy")):
        refs, hyps = [], []
        t1 = time.time()
        for c in clips:
            fn = os.path.join(d, c["file"].replace("clip", prefix))
            segs, _ = model.transcribe(load_wav(fn), language="es", beam_size=5, vad_filter=False)
            hyps.append(norm(" ".join(s.text for s in segs)))
            refs.append(norm(c["ref"]))
        el = time.time() - t1
        wer = jiwer.wer(refs, hyps)
        print(f"{m:16s} {kind:11s} WER {wer*100:5.1f} %  tiempo {el:6.1f} s  "
              f"factor tiempo real {el/total:.2f}  (carga {load:.1f} s)", flush=True)
    del model
