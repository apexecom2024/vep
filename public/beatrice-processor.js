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
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length > 0 && input[0].length > 0) {
      const channel = input[0];
      
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
      
      this.port.postMessage(outputData);
    }
    return true;
  }
}

registerProcessor('beatrice-processor', BeatriceProcessor);
