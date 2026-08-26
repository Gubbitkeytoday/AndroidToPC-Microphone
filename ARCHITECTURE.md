# Technical Architecture & Low-Latency Audio Pipeline

## 🎚️ 1. Audio Processing Pipeline

1. **Audio Capture (`navigator.mediaDevices.getUserMedia`)**:
   - `sampleRate: 48000` (Standard broadcast quality).
   - `channelCount: 1` (Mono channel to minimize bandwidth).
   - Browser pre-processing DSP (`echoCancellation: false`, `noiseSuppression: false`, `autoGainControl: false`) is disabled to preserve raw microphone fidelity and minimize software latency.

2. **PCM Frame Quantization**:
   - Web Audio `Float32Array` values $[-1.0, 1.0]$ are quantized into 16-bit signed integers (`Int16Array`) with direct bit-packing into an `ArrayBuffer`.
   - Chunk buffer size: $1024 \text{ samples} \div 48000 \text{ Hz} \approx 21.33 \text{ ms}$ packet interval.

3. **WebSocket Binary Transport**:
   - Raw binary buffers are dispatched directly over TCP/WebSocket without JSON encapsulation or Base64 encoding overhead.
