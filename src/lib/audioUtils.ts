/**
 * Converts audio base64 (PCM or MP3) into a playable/downloadable Blob URL
 */
export function base64ToAudioBlobUrl(base64Data: string, mimeType = 'audio/mp3'): string {
  if (mimeType.includes('pcm')) {
    return pcmBase64ToWavBlobUrl(base64Data);
  }
  const binaryString = window.atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType.split(';')[0] || 'audio/mp3' });
  return URL.createObjectURL(blob);
}

/**
 * Converts raw 16-bit PCM base64 string (24kHz) from Gemini TTS into a playable WAV Blob URL
 */
export function pcmBase64ToWavBlobUrl(base64Pcm: string, sampleRate = 24000): string {
  const binaryString = window.atob(base64Pcm);
  const len = binaryString.length;
  const pcmBytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    pcmBytes[i] = binaryString.charCodeAt(i);
  }

  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmBytes.length;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const wavBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(wavBuffer);

  /* RIFF chunk descriptor */
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  /* fmt sub-chunk */
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true);  // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  /* data sub-chunk */
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM data
  const pcmView = new Uint8Array(wavBuffer, headerSize);
  pcmView.set(pcmBytes);

  const blob = new Blob([wavBuffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Fallback Web Speech Synthesis player helper with real-time progress callbacks
 */
export function speakWithWebSpeech(
  text: string,
  voiceLangCode: string,
  rate = 1.0,
  onEnd?: () => void,
  onProgress?: (percent: number, currentSecs: number, totalSecs: number) => void
) {
  if (!('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return null;
  }

  window.speechSynthesis.cancel(); // Stop active speech

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = voiceLangCode || 'en-US';
  utterance.rate = rate;

  const estimatedTotalSecs = Math.max(5, Math.ceil((text.length / 14) / rate));
  let timer: any = null;
  let accumulatedSecs = 0;
  let lastActiveTimestamp = Date.now();

  const updateProgress = () => {
    if (onProgress) {
      const pct = Math.min(99, Math.round((accumulatedSecs / estimatedTotalSecs) * 100));
      onProgress(pct, accumulatedSecs, estimatedTotalSecs);
    }
  };

  utterance.onboundary = (event) => {
    if (event.charIndex !== undefined && text.length > 0 && onProgress) {
      const pct = Math.min(100, Math.round((event.charIndex / text.length) * 100));
      accumulatedSecs = (pct / 100) * estimatedTotalSecs;
      onProgress(pct, accumulatedSecs, estimatedTotalSecs);
    }
  };

  timer = setInterval(() => {
    const now = Date.now();
    const deltaSecs = (now - lastActiveTimestamp) / 1000;
    lastActiveTimestamp = now;

    // CRITICAL: Only count progress when speech is actively speaking AND NOT PAUSED!
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      accumulatedSecs = Math.min(estimatedTotalSecs, accumulatedSecs + deltaSecs);
      updateProgress();
    }
  }, 200);

  utterance.onend = () => {
    if (timer) clearInterval(timer);
    if (onProgress) onProgress(100, estimatedTotalSecs, estimatedTotalSecs);
    if (onEnd) onEnd();
  };

  utterance.onerror = () => {
    if (timer) clearInterval(timer);
    if (onEnd) onEnd();
  };

  // Try to match voice if available
  const voices = window.speechSynthesis.getVoices();
  const matchingVoice = voices.find((v) => v.lang.startsWith(voiceLangCode.split('-')[0]));
  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }

  window.speechSynthesis.speak(utterance);
  return utterance;
}

/**
 * Generates an audio/wav Blob URL client-side using Web Audio API OfflineAudioContext
 * as a guaranteed audio format fallback if server TTS is unreachable.
 */
export async function generateSyntheticWavBlobUrl(text: string, sampleRate = 24000): Promise<string> {
  const durationSecs = Math.max(3, Math.min(60, Math.ceil(text.length / 12)));
  const totalSamples = Math.floor(sampleRate * durationSecs);

  const OfflineCtx = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
  if (!OfflineCtx) {
    // Basic silent WAV buffer fallback if Web Audio API not supported
    const wavBuffer = new ArrayBuffer(44 + 4800);
    const view = new DataView(wavBuffer);
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + 4800, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, 4800, true);
    const blob = new Blob([wavBuffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  const offlineCtx = new OfflineCtx(1, totalSamples, sampleRate);

  const osc = offlineCtx.createOscillator();
  const gain = offlineCtx.createGain();

  osc.type = 'triangle';

  const now = 0;
  osc.frequency.setValueAtTime(180, now);
  for (let i = 0; i < text.length; i++) {
    const time = (i / text.length) * durationSecs;
    const charCode = text.charCodeAt(i);
    const freq = 130 + (charCode % 140);
    osc.frequency.exponentialRampToValueAtTime(Math.max(80, freq), now + time);
  }

  gain.gain.setValueAtTime(0.3, 0);
  gain.gain.exponentialRampToValueAtTime(0.01, durationSecs - 0.05);

  osc.connect(gain);
  gain.connect(offlineCtx.destination);

  osc.start(0);
  osc.stop(durationSecs);

  const renderedBuffer = await offlineCtx.startRendering();
  const channelData = renderedBuffer.getChannelData(0);

  const pcm16 = new Int16Array(channelData.length);
  for (let i = 0; i < channelData.length; i++) {
    const s = Math.max(-1, Math.min(1, channelData[i]));
    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }

  let binary = '';
  const bytes = new Uint8Array(pcm16.buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = window.btoa(binary);
  return pcmBase64ToWavBlobUrl(base64, sampleRate);
}
