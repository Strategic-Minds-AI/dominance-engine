import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import { setVariant, recordVisit } from "@/lib/ab";

const EDEN_FIELDS = [
  "first_name", "address", "phone", "email", "business_stage",
  "business", "vision", "colors", "special_requests",
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

function pickEdenVoice() {
  if (!("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices?.length) return null;
  const preferred = [/aria/i, /samantha/i, /jenny/i, /zira/i, /ava/i, /serena/i, /google us english/i, /female/i];
  for (const rule of preferred) {
    const match = voices.find((v) => rule.test(v.name) && /^en/i.test(v.lang || "en"));
    if (match) return match;
  }
  return voices.find((v) => /^en/i.test(v.lang || "")) || voices[0];
}

export default function SiteVersionView() {
  const { slug } = useParams();
  const [version, setVersion] = useState(null);
  const [pack, setPack] = useState(null);
  const [state, setState] = useState("loading");
  const frameRef = useRef(null);
  const edenRef = useRef({
    sessionId: "", currentField: "first_name", history: [], started: false, recognition: null, audio: null,
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await base44.entities.SiteVersion.filter({ slug, status: "live" }, { limit: 1 });
        const v = res.items?.[0];
        if (!alive) return;
        if (!v) { setState("notfound"); return; }
        setVersion(v);
        const pr = await base44.entities.TemplatePack.filter({ id: v.template_pack_id, status: "approved" }, { limit: 1 });
        const p = pr.items?.[0];
        if (!alive) return;
        if (!p) { setState("notfound"); return; }
        setPack(p);
        setVariant(v.slug);
        recordVisit(v.slug, v.id, false);
        setState("live");
      } catch {
        if (alive) setState("notfound");
      }
    })();
    return () => {
      alive = false;
      try { if (edenRef.current.audio) { edenRef.current.audio.pause(); edenRef.current.audio.src = ""; edenRef.current.audio = null; } } catch {}
      try { edenRef.current.recognition?.stop(); } catch {}
      try { window.speechSynthesis?.cancel(); } catch {}
    };
  }, [slug]);

  if (state === "loading") {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-7 h-7 animate-spin text-muted-foreground" /></div>;
  }

  if (state !== "live" || !pack) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background text-foreground">
        <p className="font-heading text-2xl">This version isn't live.</p>
        <Link to="/" className="text-xs tracking-[0.2em] uppercase text-crimson hover:underline">Back to site</Link>
      </div>
    );
  }

  const html = pack.preview_html || "<!doctype html><html><body style=\"font-family:Inter,Arial,sans-serif;padding:48px\"><h1>Version live</h1><p>Add preview HTML to this pack to render the design.</p></body></html>";

  const wireLegalIntake = (doc) => {
    doc.querySelectorAll('form[data-juris-intake="v1"]').forEach((form) => {
      if (form.dataset.jurisBridgeBound === "1") return;
      form.dataset.jurisBridgeBound = "1";
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const data = new FormData(form);
        const value = (key) => String(data.get(key) || "").trim();
        const statusNode = form.querySelector("[data-juris-status]");
        const allowedCaseTypes = new Set(["Car Accident", "Truck Collision", "Motorcycle Accident", "Pedestrian Accident", "Rideshare Accident", "Bicycle Accident", "Other"]);
        const allowedUrgency = new Set(["Immediate", "Within a week", "Exploring options"]);
        const caseType = allowedCaseTypes.has(value("case_type")) ? value("case_type") : "Other";
        const urgency = allowedUrgency.has(value("urgency")) ? value("urgency") : "Exploring options";
        const payload = {
          name: value("name").slice(0, 160), email: value("email").slice(0, 254), phone: value("phone").slice(0, 40),
          case_type: caseType, location: value("location").slice(0, 240), urgency,
          description: value("description").slice(0, 5000), status: "new", source: "web_pack", variant: version.slug,
        };
        if (!payload.name || !payload.case_type) {
          if (statusNode) statusNode.textContent = "Please complete the required fields.";
          return;
        }
        try {
          if (statusNode) statusNode.textContent = "Submitting…";
          await base44.entities.Lead.create(payload);
          form.reset();
          if (statusNode) statusNode.textContent = "Thank you. Your request was received.";
        } catch {
          if (statusNode) statusNode.textContent = "We could not submit your request. Please call the firm directly.";
        }
      });
    });
  };

  const wireEden = (doc) => {
    const root = doc.querySelector('[data-eden-avatar="v1"]');
    if (!root || root.dataset.edenBridgeBound === "1") return;
    root.dataset.edenBridgeBound = "1";

    const log = doc.querySelector("#conversation-log");
    const input = doc.querySelector("#answer");
    const sendButton = doc.querySelector("#answer-btn");
    const startButton = doc.querySelector("#eden-start");
    const micButton = doc.querySelector("#eden-mic");
    const statusNode = doc.querySelector("#eden-voice-status");
    const progressBar = doc.querySelector("#progress-bar");
    const progressLabel = doc.querySelector("#progress-label");
    const inputArea = doc.querySelector("#input-area");
    const concepts = doc.querySelector("#concepts");
    const conceptGrid = doc.querySelector("#concept-grid");
    const shareResult = doc.querySelector("#share-result");

    const injectBridgeStyles = () => {
      if (doc.querySelector("#eden-bridge-style")) return;
      const style = doc.createElement("style");
      style.id = "eden-bridge-style";
      style.textContent = `
        [data-eden-avatar="v1"] .eden-photo-wrap{position:relative;overflow:hidden;border-radius:24px;border:1px solid #22577e;box-shadow:0 18px 70px rgba(0,145,255,.22)}
        [data-eden-avatar="v1"] .eden-photo{width:100%;display:block;aspect-ratio:4/5;object-fit:cover;object-position:center}
        [data-eden-avatar="v1"] .eden-orbit{position:absolute;inset:10%;border:1px solid rgba(56,193,255,.35);border-radius:50%;opacity:.35;pointer-events:none}
        [data-eden-avatar="v1"].eden-speaking .eden-photo-wrap{box-shadow:0 0 0 1px rgba(91,220,255,.55),0 22px 90px rgba(0,145,255,.42)}
        [data-eden-avatar="v1"].eden-speaking .eden-orbit{animation:edenPulse .72s ease-in-out infinite alternate;opacity:.85}
        [data-eden-avatar="v1"].eden-speaking .eden-photo{animation:edenBreath .7s ease-in-out infinite alternate}
        #eden-voice-status{font-size:.72rem;color:#77dfff;margin-top:8px;min-height:18px}
        #eden-start,#eden-mic{border:1px solid #205177;background:#081624;color:#dff7ff;border-radius:999px;padding:8px 12px;font-size:.72rem;font-weight:800;cursor:pointer}
        #eden-start:hover,#eden-mic:hover{background:#0c2940}
        #eden-mic.listening{background:#113a32;color:#9dffd4;border-color:#2b8b71}
        @keyframes edenPulse{from{transform:scale(.96);opacity:.38}to{transform:scale(1.03);opacity:.96}}
        @keyframes edenBreath{from{transform:scale(1)}to{transform:scale(1.012)}}
      `;
      doc.head.appendChild(style);
    };

    const bubble = (text, who = "ai") => {
      if (!log) return;
      const node = doc.createElement("div");
      node.className = "bubble " + who;
      node.textContent = text;
      log.appendChild(node);
      log.scrollTop = log.scrollHeight;
    };

    const setVoiceStatus = (text) => { if (statusNode) statusNode.textContent = text || ""; };

    const updateProgress = (collected = {}, completed = false) => {
      const count = EDEN_FIELDS.filter((field) => String(collected?.[field] || "").trim()).length;
      const pct = completed ? 100 : Math.max(8, Math.round((count / EDEN_FIELDS.length) * 100));
      if (progressBar) progressBar.style.width = pct + "%";
      if (progressLabel) progressLabel.textContent = completed ? "Business Genome complete" : `Step ${Math.min(count + 1, EDEN_FIELDS.length)} of ${EDEN_FIELDS.length}`;
    };

    const stopVoice = () => {
      try { if (edenRef.current.audio) { edenRef.current.audio.pause(); edenRef.current.audio.currentTime = 0; edenRef.current.audio.src = ""; edenRef.current.audio = null; } } catch {}
      try { window.speechSynthesis?.cancel(); } catch {}
      root.classList.remove("eden-speaking");
    };

    const speakWithBrowserFallback = (text) => {
      if (!text || !("speechSynthesis" in window)) { root.classList.remove("eden-speaking"); setVoiceStatus("Voice playback is unavailable."); return; }
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voice = pickEdenVoice();
        if (voice) utterance.voice = voice;
        utterance.lang = voice?.lang || "en-US";
        utterance.rate = 0.98;
        utterance.onstart = () => { root.classList.add("eden-speaking"); setVoiceStatus("Eden is speaking…"); };
        utterance.onend = () => { root.classList.remove("eden-speaking"); setVoiceStatus("Ready"); };
        utterance.onerror = () => { root.classList.remove("eden-speaking"); setVoiceStatus("Voice playback is unavailable."); };
        window.speechSynthesis.speak(utterance);
      } catch { root.classList.remove("eden-speaking"); setVoiceStatus("Voice playback is unavailable."); }
    };

    const speak = async (text) => {
      if (!text) return;
      stopVoice();
      setVoiceStatus("Preparing Eden's natural voice…");
      try {
        const res = await base44.functions.invoke("aiSpeech", { text, ...EDEN_VOICE, response_format: "mp3", eden_session_id: edenRef.current.sessionId || undefined });
        const data = res.data || {};
        if (!data.audio_base64) throw new Error(data.error || "No speech audio returned");
        const src = `data:${data.content_type || "audio/mpeg"};base64,${data.audio_base64}`;
        const audio = new Audio(src);
        edenRef.current.audio = audio;
        audio.onplay = () => { root.classList.add("eden-speaking"); setVoiceStatus("Eden is speaking…"); };
        audio.onended = () => { if (edenRef.current.audio === audio) edenRef.current.audio = null; root.classList.remove("eden-speaking"); setVoiceStatus("Ready"); };
        audio.onerror = () => { if (edenRef.current.audio === audio) edenRef.current.audio = null; root.classList.remove("eden-speaking"); setVoiceStatus("AI voice playback failed. Using browser fallback."); speakWithBrowserFallback(text); };
        await audio.play();
      } catch { setVoiceStatus("Using browser voice fallback…"); speakWithBrowserFallback(text); }
    };

    const renderConcepts = (collected = {}) => {
      if (!concepts || !conceptGrid) return;
      concepts.classList.add("show");
      conceptGrid.innerHTML = "";
      const colors = [["#0068ff","#24b7ff"],["#0d0f13","#8597aa"],["#6a2cff","#d08cff"],["#2b3f36","#b7d7c2"],["#3a1b1b","#ff7a55"],["#f3f4f7","#aac4d8"],["#08111d","#39d2ff"],["#2e1d17","#e0a46c"],["#181818","#eeeeee"],["#132839","#5986a9"]];
      colors.forEach(([a,b], index) => {
        const el = doc.createElement("div");
        el.className = "concept";
        el.innerHTML = `<div class="concept-preview" style="background:linear-gradient(135deg,${a},${b})"><div class="line"></div><div class="big"></div><div class="line" style="width:45%"></div></div><footer>Direction ${String(index + 1).padStart(2,"0")} • ${collected.business || "Your Business"}</footer>`;
        el.addEventListener("click", () => {
          doc.querySelectorAll(".concept").forEach((x) => { x.style.outline = "none"; });
          el.style.outline = "3px solid #24b7ff";
          try { frameRef.current?.contentWindow?.localStorage?.setItem("sm_business_genome", JSON.stringify({ ...collected, selected_direction: index + 1 })); } catch {}
          if (shareResult) { shareResult.innerHTML = `<strong>Direction ${index + 1} selected.</strong><br>Your selection is saved in this prototype. Production delivery to SMS/email remains approval and provider dependent.`; }
        });
        conceptGrid.appendChild(el);
      });
    };

    const callEden = async (message = "") => {
      const payload = { session_id: edenRef.current.sessionId, message, current_field: edenRef.current.currentField, source_pack_id: pack.id, source_version_slug: version.slug };
      const res = await base44.functions.invoke("edenAvatarChat", payload);
      const data = res.data || {};
      if (!data.ok) throw new Error(data.error || "Eden did not respond.");
      edenRef.current.sessionId = data.session_id || edenRef.current.sessionId;
      edenRef.current.currentField = data.next_field || "";
      edenRef.current.history.push({ role: "assistant", content: data.reply || "" });
      bubble(data.reply || "I'm ready.", "ai");
      updateProgress(data.collected || {}, !!data.completed);
      speak(data.reply || "");
      if (data.completed) { if (inputArea) inputArea.style.display = "none"; renderConcepts(data.collected || {}); }
      return data;
    };

    const start = async () => {
      if (edenRef.current.started) { const last = edenRef.current.history.filter((x) => x.role === "assistant").at(-1)?.content; if (last) speak(last); return; }
      edenRef.current.started = true;
      if (startButton) { startButton.textContent = "Replay Eden"; startButton.disabled = true; }
      setVoiceStatus("Connecting Eden…");
      try { await callEden(""); if (startButton) startButton.disabled = false; input?.focus(); }
      catch (error) { edenRef.current.started = false; if (startButton) { startButton.disabled = false; startButton.textContent = "Talk to Eden"; } setVoiceStatus(error?.message || "Eden is temporarily unavailable."); }
    };

    const submit = async () => {
      const text = String(input?.value || "").trim();
      if (!text) return;
      if (!edenRef.current.started) { edenRef.current.started = true; if (startButton) startButton.textContent = "Replay Eden"; }
      bubble(text, "you");
      edenRef.current.history.push({ role: "user", content: text });
      input.value = "";
      sendButton && (sendButton.disabled = true);
      setVoiceStatus("Eden is thinking…");
      try { await callEden(text); }
      catch (error) { bubble("I hit a temporary connection problem. Please try that again.", "ai"); setVoiceStatus(error?.message || "Connection problem"); }
      finally { sendButton && (sendButton.disabled = false); input?.focus(); }
    };

    const setupRecognition = () => {
      const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!Recognition || !micButton) { if (micButton) micButton.style.display = "none"; return; }
      const recognition = new Recognition();
      recognition.lang = "en-US"; recognition.interimResults = false; recognition.continuous = false;
      edenRef.current.recognition = recognition;
      recognition.onstart = () => { micButton.classList.add("listening"); micButton.textContent = "Listening…"; setVoiceStatus("I'm listening."); };
      recognition.onresult = async (event) => { const text = event.results?.[0]?.[0]?.transcript || ""; if (input) input.value = text; micButton.classList.remove("listening"); micButton.textContent = "🎙 Speak"; if (text.trim()) await submit(); };
      recognition.onerror = () => { micButton.classList.remove("listening"); micButton.textContent = "🎙 Speak"; setVoiceStatus("Microphone input was unavailable. You can type instead."); };
      recognition.onend = () => { micButton.classList.remove("listening"); micButton.textContent = "🎙 Speak"; };
      micButton.addEventListener("click", () => { try { if (!edenRef.current.started) start(); recognition.start(); } catch {} });
    };

    injectBridgeStyles();
    if (log) log.innerHTML = "";
    if (progressBar) progressBar.style.width = "8%";
    if (progressLabel) progressLabel.textContent = "Ready to begin";
    setVoiceStatus("Tap \"Talk to Eden\" to begin.");
    startButton?.addEventListener("click", start);
    sendButton?.addEventListener("click", submit);
    input?.addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); submit(); } });
    setupRecognition();
    if ("speechSynthesis" in window) { window.speechSynthesis.getVoices(); window.speechSynthesis.onvoiceschanged = () => pickEdenVoice(); }
  };

  const wirePackBridge = () => {
    const doc = frameRef.current?.contentDocument;
    if (!doc || !version) return;
    wireLegalIntake(doc);
    wireEden(doc);
  };

  return (
    <iframe
      ref={frameRef}
      title={version.name}
      srcDoc={html}
      onLoad={wirePackBridge}
      sandbox="allow-same-origin allow-popups allow-forms"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", border: 0, background: "#fff" }}
    />
  );
}