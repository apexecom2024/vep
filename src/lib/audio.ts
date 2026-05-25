/**
 * Audio processing utilities for Gemini Live API
 */

export const pcmToBase64 = (float32Array: Float32Array): string => {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  const uint8Array = new Uint8Array(int16Array.buffer);
  let binary = "";
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
};

export const base64ToPcm = (base64: string): Float32Array => {
  const binary = atob(base64);
  const uint8Array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    uint8Array[i] = binary.charCodeAt(i);
  }
  const int16Array = new Int16Array(uint8Array.buffer);
  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 0x8000;
  }
  return float32Array;
};

export class AudioQueue {
  private audioCtx: AudioContext;
  private nextStartTime: number = 0;

  constructor(audioCtx: AudioContext) {
    this.audioCtx = audioCtx;
  }

  enqueue(pcmData: Float32Array, outputNode: AudioNode = this.audioCtx.destination) {
    const buffer = this.audioCtx.createBuffer(1, pcmData.length, this.audioCtx.sampleRate);
    buffer.getChannelData(0).set(pcmData);

    const source = this.audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(outputNode);

    const currentTime = this.audioCtx.currentTime;
    if (this.nextStartTime < currentTime) {
      this.nextStartTime = currentTime;
    }

    source.start(this.nextStartTime);
    this.nextStartTime += buffer.duration;
  }

  clear() {
    this.nextStartTime = 0;
  }
}
