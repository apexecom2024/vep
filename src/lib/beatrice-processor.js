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
      const filtered = new Float32Array(channel.length);
      for (let i = 0; i < channel.length; i++) {
        const x = channel[i];
        // Biquad filter: y[n] = b0*x[n] + b1*x[n-1] + b2*x[n-2] - a1*y[n-1] - a2*y[n-2]
        const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
        
        this.x2 = this.x1; this.x1 = x;
        this.y2 = this.y1; this.y1 = y;
        filtered[i] = y;
      }
      this.port.postMessage(filtered);
    }
    return true;
  }
}

registerProcessor('beatrice-processor', BeatriceProcessor);
