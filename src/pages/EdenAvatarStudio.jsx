import React, { useEffect, useMemo, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Mic, MicOff, Play, Square, Send, Sparkles, Volume2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";

const EDEN_IMG = "https://media.base44.com/images/public/6ac7bc6cf0b681d8bc7f7aeb/28a0b6e5a_FuturisticExecutiveattheHolographicConsole.png";

const fields = [
  "first_name","address","phone","email","business_stage","business","vision","colors","special_requests"
];

const EDEN_VOICE = {
  model: "openai/tts-1-hd",
  voice: "nova",
  speed: 0.98,
  instructions:
    "Speak as Eden Skye, Strategic Minds AI's clearly disclosed AI client concierge. " +
    "Warm, confident, polished, natural, conversational, and lightly playful. " +
    "Use natural pauses and varied intonation at a calm medium pace. " +
    "Never sound like an announcer, IVR, GPS, computer narrator, or sales script.",
};

function chooseVoice() {
  if (!("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  const rules = [/aria/i,/samantha/i,/jenny/i,/zira/i,/ava/i,/serena/i,/google us english/i,/female/i];
  for (const rule of rules) {
    const found = voices.find((v) => rule.test(v.name) && /^en/i.test(v.lang || "en"));
    if (found) return found;
  }
  return voices.find((v) => /^en/i.test(v.lang || "")) || voices[0] || null;
}

export default function EdenAvatarStudio() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [currentField, setCurrentField] = useState("first_name");
  const [collected, setCollected] = useState({});
  const [busy, setBusy] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState("Ready");
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  const completedCount = useMemo(
    () => fields.filter((f) => String(collected?.[f] || "").trim()).length,
    [collected]
  );

  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => chooseVoice();
    }
    return () => {
      try { if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; audioRef.current = null; } } catch {}
      try { window.speechSynthesis?.cancel(); } catch {}
      try { recognitionRef.current?.stop(); } catch {}
    };
  }, []);

  const stopVoice = () => {
    try { if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; audioRef.current.src = ""; audioRef.current = null; } } catch {}
    try { window.speechSynthesis?.cancel(); } catch {}
    setSpeaking(false);
    setStatus("Ready");
  };

  const speakWithBrowserFallback = (text) => {
    if (!text || !("speechSynthesis" in window)) { setSpeaking(false); setStatus("Voice playback unavailable"); return; }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = chooseVoice();
      if (voice) utterance.voice = voice;
      utterance.lang = voice?.lang || "en-US";
      utterance.rate = 0.98;
      utterance.pitch = 1.02;
      utterance.onstart = () => { setSpeaking(true); setStatus("Eden is speaking"); };
      utterance.onend = () => { setSpeaking(false); setStatus("Ready"); };
      utterance.onerror = () => { setSpeaking(false); setStatus("Voice playback unavailable"); };
      window.speechSynthesis.speak(utterance);
    } catch { setSpeaking(false); setStatus("Voice playback unavailable"); }
  };

  const speak = async (text, edenSessionId = sessionId) => {
    if (!text) return;
    stopVoice();
    setStatus("Preparing Eden's natural voice…");
    try {
      const res = await base44.functions.invoke("aiSpeech", { text, ...EDEN_VOICE, response_format: "mp3", eden_session_id: edenSessionId || undefined });
      const data = res.data || {};
      if (!data.audio_base64) throw new Error(data.error || "No speech audio returned");
      const src = `data:${data.content_type || "audio/mpeg"};base64,${data.audio_base64}`;
      const audio = new Audio(src);
      audioRef.current = audio;
      audio.onplay = () => { setSpeaking(true); setStatus("Eden is speaking"); };
      audio.onended = () => { if (audioRef.current === audio) audioRef.current = null; setSpeaking(false); setStatus("Ready"); };
      audio.onerror = () => { if (audioRef.current === audio) audioRef.current = null; setSpeaking(false); setStatus("AI voice playback failed. Using browser fallback."); speakWithBrowserFallback(text); };
      await audio.play();
    } catch { setStatus("Using browser voice fallback…"); speakWithBrowserFallback(text); }
  };

  const callEden = async (message = "") => {
    setBusy(true);
    setStatus(message ? "Eden is thinking" : "Connecting Eden");
    try {
      const res = await base44.functions.invoke("edenAvatarChat", {
        session_id: sessionId, message, current_field: currentField,
        source_pack_id: "6ac71c6dc14ec9b30a6c3938", source_version_slug: "eden-avatar-studio",
      });
      const data = res.data || {};
      if (!data.ok) throw new Error(data.error || "Eden did not respond");
      setSessionId(data.session_id || sessionId);
      setCurrentField(data.next_field || "");
      setCollected(data.collected || {});
      setMessages((m) => [...m, { role: "assistant", content: data.reply || "I'm ready." }]);
      speak(data.reply || "", data.session_id || sessionId);
      if (data.completed) setStatus("Business Genome complete");
      return data;
    } catch (error) {
      const text = error?.message || "Eden could not connect.";
      setMessages((m) => [...m, { role: "assistant", content: "I hit a temporary connection problem. Please try again." }]);
      setStatus(text);
      throw error;
    } finally { setBusy(false); }
  };

  const start = async () => {
    if (messages.length) { const last = [...messages].reverse().find((m) => m.role === "assistant"); if (last) speak(last.content); return; }
    await callEden("");
  };

  const send = async (text = input) => {
    const value = String(text || "").trim();
    if (!value || busy) return;
    setMessages((m) => [...m, { role: "user", content: value }]);
    setInput("");
    await callEden(value);
  };

  const toggleMic = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { setStatus("Speech recognition is unavailable in this browser. Type instead."); return; }
    if (listening && recognitionRef.current) { recognitionRef.current.stop(); return; }
    const recognition = new Recognition();
    recognition.lang = "en-US"; recognition.interimResults = false; recognition.continuous = false;
    recognitionRef.current = recognition;
    recognition.onstart = () => { setListening(true); setStatus("Listening"); };
    recognition.onend = () => { setListening(false); if (!speaking) setStatus("Ready"); };
    recognition.onerror = () => { setListening(false); setStatus("Microphone unavailable"); };
    recognition.onresult = (event) => { const text = event.results?.[0]?.[0]?.transcript || ""; setInput(text); if (text.trim()) send(text); };
    try { recognition.start(); } catch {}
  };

  const reset = () => {
    stopVoice();
    setMessages([]); setSessionId(""); setCurrentField("first_name"); setCollected({});
    setStatus("Ready"); setSpeaking(false); setListening(false);
  };

  return (
    <div className="min-h-screen bg-[#05070b] text-white">
      <header className="border-b border-cyan-400/10 bg-black/40 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-[.28em] text-cyan-300 uppercase">Strategic Minds AI</div>
            <div className="font-semibold">Eden Avatar Studio</div>
          </div>
          <Link to="/admin" className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Admin
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-[420px_1fr] gap-8">
        <section className="rounded-[32px] border border-cyan-300/15 bg-gradient-to-b from-[#0b1a2a] to-[#060b12] p-5 shadow-[0_35px_100px_rgba(0,115,255,.20)] h-max">
          <div className={`relative overflow-hidden rounded-[26px] border border-cyan-300/20 ${speaking ? "shadow-[0_0_55px_rgba(36,183,255,.42)]" : ""}`}>
            <Image src={EDEN_IMG} alt="Eden Skye, AI client concierge" fittingType="fill" className={`w-full aspect-[4/5] object-cover transition-transform duration-300 ${speaking ? "scale-[1.012]" : "scale-100"}`} />
            <div className={`absolute inset-[10%] rounded-full border border-cyan-300/30 pointer-events-none ${speaking ? "animate-pulse opacity-100" : "opacity-30"}`} />
            <div className="absolute left-4 top-4 rounded-full border border-cyan-300/20 bg-black/50 px-3 py-1 text-[10px] tracking-[.18em] uppercase text-cyan-200 backdrop-blur">AI Concierge</div>
          </div>

          <div className="pt-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold">Eden Skye</h1>
                <p className="text-sm text-cyan-200/75">Strategic Minds AI Client Concierge</p>
              </div>
              <div className={`h-3 w-3 rounded-full ${speaking || listening ? "bg-emerald-400 shadow-[0_0_16px_#34d399]" : "bg-cyan-400/50"}`} />
            </div>

            <p className="mt-4 text-sm text-slate-400">This is the live V2 voice runtime: AI conversation, persistent onboarding state, natural AI speech through Vercel AI Gateway, microphone input, and browser speech only as a fallback. Eden is an AI, not a human representative.</p>

            <div className="mt-5 h-2 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 transition-all" style={{ width: `${Math.max(7, (completedCount / fields.length) * 100)}%` }} />
            </div>
            <div className="mt-2 text-xs text-slate-500">{completedCount} / {fields.length} onboarding fields captured</div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button onClick={start} disabled={busy} className="rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 text-xs font-bold inline-flex items-center gap-2 disabled:opacity-50">
                <Play className="w-3.5 h-3.5" /> {messages.length ? "Replay Eden" : "Talk to Eden"}
              </button>
              <button onClick={toggleMic} className={`rounded-full border px-4 py-2 text-xs font-semibold inline-flex items-center gap-2 ${listening ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200" : "border-white/10 text-slate-300"}`}>
                {listening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                {listening ? "Stop" : "Speak"}
              </button>
              <button onClick={stopVoice} className="rounded-full border border-white/10 px-4 py-2 text-xs text-slate-300 inline-flex items-center gap-2">
                <Square className="w-3.5 h-3.5" /> Stop voice
              </button>
            </div>

            <div className="mt-4 text-xs text-cyan-200/70 inline-flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5" /> {status}
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-[#07111b] min-h-[720px] flex flex-col overflow-hidden">
          <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
            <div>
              <div className="font-semibold">Live onboarding conversation</div>
              <div className="text-xs text-slate-500">Session {sessionId || "not started"}</div>
            </div>
            <button onClick={reset} className="text-xs border border-white/10 rounded-full px-3 py-1.5 text-slate-400 hover:text-white">Reset</button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {!messages.length && (
              <div className="h-full min-h-[440px] grid place-items-center text-center">
                <div>
                  <Sparkles className="w-8 h-8 mx-auto text-cyan-300 mb-3" />
                  <div className="text-xl font-medium">Eden is ready.</div>
                  <p className="text-sm text-slate-500 mt-2 max-w-md">Click Talk to Eden. Browser autoplay rules require one human interaction before voice playback begins.</p>
                </div>
              </div>
            )}
            {messages.map((message, index) => (
              <div key={index} className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm ${message.role === "user" ? "ml-auto bg-gradient-to-br from-blue-500 to-blue-700" : "bg-[#0d263b] border border-cyan-300/10"}`}>
                {message.content}
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-white/10">
            <div className="flex gap-3">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(); }} placeholder="Type to Eden…" className="flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-cyan-300/30" />
              <button onClick={() => send()} disabled={busy || !input.trim()} className="rounded-2xl bg-cyan-500 text-slate-950 px-4 font-bold disabled:opacity-40">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}