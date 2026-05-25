/**
 * AudioWorkletProcessor for Beatrice AI
 */
class BeatriceProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    // Biquad band-pass filter coefficients for voice (~300Hz-3400Hz at 24kHz sample rate)
    this.b0 = 0.0766; this.b1 = 0; this.b2 = -0.0766;
    this.a1 = -1.614; this.a2 = 0.8468;
    this.x1 = 0; this.x2 = 0;
    this.y1 = 0; this.y2 = 0;
    
    // VAD parameters
    this.vadThreshold = 0.005; // RMS threshold
    this.hangoverDuration = 20; // chunks (~250ms at 128 samples/chunk)
    this.hangoverCount = 0;
    this.isSpeaking = false;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length > 0 && input[0].length > 0) {
      const channel = input[0];
      
      // Calculate RMS for VAD
      let sumSquares = 0;
      for (let i = 0; i < channel.length; i++) {
        sumSquares += channel[i] * channel[i];
      }
      const rms = Math.sqrt(sumSquares / channel.length);
      
      // Smooth VAD logic
      const wasSpeaking = this.isSpeaking;
      if (rms > this.vadThreshold) {
        this.isSpeaking = true;
        this.hangoverCount = this.hangoverDuration;
      } else {
        if (this.hangoverCount > 0) {
          this.hangoverCount--;
        } else {
          this.isSpeaking = false;
        }
      }

      if (this.isSpeaking !== wasSpeaking) {
        this.port.postMessage({ type: 'vad', isSpeaking: this.isSpeaking });
      }

      // If not speaking, send zeroed audio or skip (depending on backend expectation)
      if (!this.isSpeaking) {
        return true; 
      }
      
      // Downsample from 24kHz to 16kHz (1.5:1 ratio)
      // Input: [0, 1, 2, 3, 4, 5] -> Output: [0, (1+2)/2, 3, (4+5)/2]
      const outputLength = Math.floor((channel.length * 2) / 3);
      const outputData = new Float32Array(outputLength);
      
      let outIdx = 0;
      for (let i = 0; i < channel.length - 1; i += 3) {
        if (outIdx < outputLength) {
          outputData[outIdx++] = channel[i];
        }
        if (outIdx < outputLength && i + 2 < channel.length) {
          outputData[outIdx++] = (channel[i+1] + channel[i+2]) / 2;
        }
      }
      
      this.port.postMessage({ type: 'audio', data: outputData });
    }
    return true;
  }
}

registerProcessor('beatrice-processor', BeatriceProcessor);
