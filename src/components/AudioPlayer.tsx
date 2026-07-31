import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, Download, Sparkles, Languages, Radio, FileText, Check, FastForward, Globe } from 'lucide-react';
import { AudioScript } from '../types';
import { base64ToAudioBlobUrl, pcmBase64ToWavBlobUrl, speakWithWebSpeech, generateSyntheticWavBlobUrl } from '../lib/audioUtils';
import { SUPPORTED_LANGUAGES } from '../data/languages';

interface AudioPlayerProps {
  audioScript: AudioScript;
  selectedLanguage: string;
  segmentTitle: string;
  simplifiedContent?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioScript,
  selectedLanguage,
  segmentTitle,
  simplifiedContent,
}) => {
  const [currentAudioScript, setCurrentAudioScript] = useState<AudioScript>(audioScript);
  const [currentLangCode, setCurrentLangCode] = useState<string>(() => {
    const matched = SUPPORTED_LANGUAGES.find(l => l.name.toLowerCase() === selectedLanguage.toLowerCase() || l.code === selectedLanguage);
    return matched ? matched.code : 'yo';
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGeneratingGeminiAudio, setIsGeneratingGeminiAudio] = useState(false);
  const [isTranslatingScript, setIsTranslatingScript] = useState(false);
  const [activeVoice, setActiveVoice] = useState('Kore');
  const [audioSourceType, setAudioSourceType] = useState<'gemini' | 'speech' | 'none'>('none');
  const [copied, setCopied] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLangCode) || SUPPORTED_LANGUAGES[0];

  // Update when prop audioScript changes
  useEffect(() => {
    setCurrentAudioScript(audioScript);
    const matched = SUPPORTED_LANGUAGES.find(l => l.name.toLowerCase() === selectedLanguage.toLowerCase() || l.code === selectedLanguage);
    if (matched) setCurrentLangCode(matched.code);
  }, [audioScript, selectedLanguage]);

  // Synthesize TTS for a given script text & voice
  const fetchGeminiTtsForScript = async (text: string, voiceName: string, langName: string) => {
    try {
      setIsGeneratingGeminiAudio(true);
      const res = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: voiceName,
          language: langName,
        }),
      });

      if (!res.ok) throw new Error('Gemini TTS failed');

      const data = await res.json();
      if (data.audioBase64) {
        const url = base64ToAudioBlobUrl(data.audioBase64, data.mimeType);
        setAudioUrl(url);
        setAudioSourceType('gemini');
      }
    } catch (err) {
      console.warn('Gemini TTS endpoint unavailable or errored, using Web Speech fallback:', err);
      setAudioSourceType('speech');
    } finally {
      setIsGeneratingGeminiAudio(false);
    }
  };

  useEffect(() => {
    fetchGeminiTtsForScript(currentAudioScript.narratorScript, activeVoice, currentLangObj.name);

    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [currentAudioScript.narratorScript]);

  // Handle changing audio language for this same resource
  const handleLanguageChange = async (newCode: string) => {
    if (newCode === currentLangCode && currentAudioScript) return;

    const targetLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === newCode) || SUPPORTED_LANGUAGES[0];

    try {
      setIsTranslatingScript(true);
      setCurrentLangCode(newCode);

      if (audioRef.current) audioRef.current.pause();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsPlaying(false);

      const res = await fetch('/api/translate-audio-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          segmentTitle,
          content: simplifiedContent || currentAudioScript.narratorScript,
          targetLanguage: targetLangObj.name,
        }),
      });

      if (!res.ok) throw new Error('Failed to translate audio script');

      const newScript: AudioScript = await res.json();
      setCurrentAudioScript(newScript);

      await fetchGeminiTtsForScript(newScript.narratorScript, activeVoice, targetLangObj.name);
    } catch (err) {
      console.error('Error changing audio language:', err);
    } finally {
      setIsTranslatingScript(false);
    }
  };

  const [isDownloading, setIsDownloading] = useState(false);

  // Handle Play/Pause
  const togglePlay = () => {
    if (isPlaying) {
      if (audioSourceType === 'gemini' && audioRef.current) {
        audioRef.current.pause();
      } else if (audioSourceType === 'speech' && 'speechSynthesis' in window) {
        window.speechSynthesis.pause();
      }
      setIsPlaying(false);
    } else {
      if (audioSourceType === 'gemini' && audioRef.current) {
        audioRef.current.playbackRate = playbackRate;
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        if ('speechSynthesis' in window && window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
          setIsPlaying(true);
        } else {
          speakWithWebSpeech(
            currentAudioScript.narratorScript,
            currentLangObj.voiceLangCode,
            playbackRate,
            () => setIsPlaying(false),
            (percent, currentSecs, totalSecs) => {
              setAudioProgress(percent);
              setCurrentTime(currentSecs);
              setDuration(totalSecs);
            }
          );
          setAudioSourceType('speech');
          setIsPlaying(true);
        }
      }
    }
  };

  const triggerAudioDownload = (url: string, isMp3 = false) => {
    const safeTitle = segmentTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeTitle}_${currentLangObj.name}_Audio.${isMp3 ? 'mp3' : 'wav'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadAudio = async () => {
    if (audioUrl) {
      triggerAudioDownload(audioUrl);
      return;
    }

    try {
      setIsDownloading(true);
      const res = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: currentAudioScript.narratorScript,
          voice: activeVoice,
          language: currentLangObj.name,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const newUrl = base64ToAudioBlobUrl(data.audioBase64, data.mimeType);
          setAudioUrl(newUrl);
          setAudioSourceType('gemini');
          triggerAudioDownload(newUrl, data.mimeType?.includes('mp3'));
          return;
        }
      }
    } catch (e) {
      console.error('Download audio generation failed:', e);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
      setAudioProgress((audioRef.current.currentTime / (audioRef.current.duration || 1)) * 100);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekPercent = parseFloat(e.target.value);
    if (audioRef.current && duration) {
      const newTime = (seekPercent / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setAudioProgress(seekPercent);
    }
  };

  const copyScript = () => {
    navigator.clipboard.writeText(currentAudioScript.narratorScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Hidden audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                On-The-Go Audio Study Segment
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full flex items-center gap-1">
                <span>{currentLangObj.flag}</span>
                <span>{currentLangObj.name}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">{segmentTitle}</p>
          </div>
        </div>

        {/* Voice Selector */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 px-2">Voice:</span>
          {['Kore', 'Zephyr', 'Fenrir', 'Puck'].map((voice) => (
            <button
              key={voice}
              onClick={() => {
                setActiveVoice(voice);
                fetchGeminiTtsForScript(currentAudioScript.narratorScript, voice, currentLangObj.name);
              }}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                activeVoice === voice
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {voice}
            </button>
          ))}
        </div>
      </div>

      {/* Language Switcher Toolbar for this resource */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="text-xs font-bold text-slate-800">Switch Audio Language:</span>
        </div>

        {/* Quick popular language pills + Full Dropdown */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['yo', 'ha', 'ig', 'en', 'fr', 'es', 'sw', 'pid'].map((code) => {
            const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
            if (!lang) return null;
            const isSelected = currentLangCode === code;
            return (
              <button
                key={code}
                onClick={() => handleLanguageChange(code)}
                disabled={isTranslatingScript || isGeneratingGeminiAudio}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
                id={`btn-audio-lang-${code}`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            );
          })}

          <select
            value={currentLangCode}
            onChange={(e) => handleLanguageChange(e.target.value)}
            disabled={isTranslatingScript || isGeneratingGeminiAudio}
            className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-bold focus:outline-none focus:border-indigo-600 transition-colors cursor-pointer"
            id="select-audio-lang"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name} ({lang.nativeName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Visual Audio Waveform & Player Console */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative overflow-hidden">
        {/* Loading overlay for TTS / Translation generation */}
        {(isGeneratingGeminiAudio || isTranslatingScript) && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-2 text-indigo-700 text-xs font-bold p-4 text-center">
            <Sparkles className="w-5 h-5 animate-spin text-indigo-600" />
            <span>
              {isTranslatingScript
                ? `Translating audio script into ${currentLangObj.name} with AI...`
                : `Synthesizing natural voice segment in ${currentLangObj.name}...`}
            </span>
          </div>
        )}

        {/* Animated equalizer bars when playing */}
        <div className="flex items-center justify-center gap-1.5 h-12 mb-6">
          {[40, 70, 30, 90, 60, 100, 45, 80, 50, 75, 35, 85, 60, 40].map((h, i) => (
            <div
              key={i}
              className={`w-1.5 bg-gradient-to-t from-indigo-600 to-emerald-500 rounded-full transition-all duration-300 ${
                isPlaying ? 'animate-bounce' : 'opacity-30'
              }`}
              style={{
                height: isPlaying ? `${Math.max(15, (h * (i % 3 + 1)) % 100)}%` : '20%',
                animationDelay: `${(i % 5) * 0.15}s`,
              }}
            />
          ))}
        </div>

        {/* Seek & Progress Bar */}
        <div className="space-y-1.5 mb-5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1.5 text-indigo-700">
              {isPlaying && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
              <span>{isPlaying ? 'Playing Audio' : 'Paused'}</span>
              <span className="text-slate-400">•</span>
              <span className="font-mono text-[11px] text-slate-500">{Math.round(audioProgress || 0)}% completed</span>
            </span>
            <span className="font-mono text-[11px] font-bold text-slate-600">
              {formatTime(currentTime)} / {formatTime(duration || 120)}
            </span>
          </div>

          <div className="relative flex items-center">
            <input
              type="range"
              min="0"
              max="100"
              value={audioProgress || 0}
              onChange={handleSeek}
              disabled={audioSourceType === 'speech'}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
              title="Seek position"
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Speed Controls */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <FastForward className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
              <button
                key={rate}
                onClick={() => handleRateChange(rate)}
                className={`px-2 py-0.5 text-[10px] font-mono rounded-md font-bold transition-colors ${
                  playbackRate === rate
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Main Play / Pause Button */}
          <button
            onClick={togglePlay}
            disabled={isGeneratingGeminiAudio || isTranslatingScript}
            className="w-14 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md shadow-indigo-200 transition-transform active:scale-95 disabled:opacity-50"
            id="btn-toggle-audio-play"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-white" />
            ) : (
              <Play className="w-6 h-6 fill-white ml-0.5" />
            )}
          </button>

          {/* Action Buttons: Copy Script & Download Audio */}
          <div className="flex items-center gap-2">
            <button
              onClick={copyScript}
              className="p-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              title="Copy Audio Script"
              id="btn-copy-audio-script"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <FileText className="w-4 h-4" />}
              <span className="hidden sm:inline">Script</span>
            </button>

            <button
              onClick={handleDownloadAudio}
              disabled={isDownloading}
              className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
              title="Download Audio (.wav)"
              id="btn-download-audio"
            >
              {isDownloading ? (
                <Sparkles className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Download className="w-4 h-4 text-white" />
              )}
              <span>Download Audio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Audio Breakdown Points */}
      {currentAudioScript.breakdownBulletPoints && currentAudioScript.breakdownBulletPoints.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Audio Explainer Highlights ({currentLangObj.name})</span>
          </h4>
          <ul className="space-y-1.5">
            {currentAudioScript.breakdownBulletPoints.map((pt, i) => (
              <li key={i} className="text-xs text-slate-700 flex items-start gap-2 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{pt}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Full Transcript Accordion */}
      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Audio Script Transcript ({currentLangObj.flag} {currentLangObj.name})
          </h4>
          <span className="text-[10px] text-slate-500 font-medium">
            Formatted for clear listening
          </span>
        </div>
        <p className="text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-line bg-white p-3 rounded-lg border border-slate-200 max-h-48 overflow-y-auto">
          {currentAudioScript.narratorScript}
        </p>
      </div>
    </div>
  );
};
