// Async.ai TTS Plugin (WAV for ExoPlayer + dynamic voice list from POST /voices)
// Pagination uses "after": next_cursor

let apiKey     = (ttsrv.userVars["apiKey"] || "").trim();
let baseUrl    = (ttsrv.userVars["baseUrl"] || "https://api.async.ai").trim();
let apiVersion = (ttsrv.userVars["apiVersion"] || "v1").trim();

let modelId    = (ttsrv.userVars["modelId"] || "asyncflow_v2.0").trim();
let sampleRate = parseInt(ttsrv.userVars["sampleRate"]) || 44100;

// TTS output (working config)
let container  = (ttsrv.userVars["container"] || "wav").trim();
let encoding   = (ttsrv.userVars["encoding"] || "pcm_s16le").trim();

// Voice list config
let voicesPageLimit = parseInt(ttsrv.userVars["voicesPageLimit"]) || 100; // per request
let maxPages        = parseInt(ttsrv.userVars["maxPages"]) || 20;         // safety cap
let voicesLanguage  = (ttsrv.userVars["voicesLanguage"] || "en").trim();
let useCache        = ((ttsrv.userVars["useCache"] || "true") + "").toLowerCase() !== "false";

function requireApiKey() {
  if (!apiKey) throw "Please set your Async.ai API key in plugin variables (apiKey).";
}

let PluginJS = {
  name: 'Async.ai (WAV + Voices)',
  id: 'async.ai.tts.wav.voices',
  author: 'TTS Server (custom)',
  description: 'Async.ai TTS via /text_to_speech (WAV) and populates voices via POST /voices',
  version: 1,

  vars: {
    apiKey:     { label: "API-KEY", hint: "Async x-api-key" },
    baseUrl:    { label: "Base URL", hint: "https://api.async.ai", default: "https://api.async.ai" },
    apiVersion: { label: "API Version", hint: "Header: version (e.g. v1)", default: "v1" },

    modelId:    { label: "Model ID", hint: "e.g. asyncflow_v2.0", default: "asyncflow_v2.0" },
    sampleRate: { label: "Sample Rate", hint: "44100 or 24000", default: "44100" },

    container:  { label: "Container", hint: "wav recommended for ExoPlayer", default: "wav" },
    encoding:   { label: "Encoding", hint: "pcm_s16le recommended", default: "pcm_s16le" },

    voicesPageLimit: { label: "Voices page limit", hint: "POST /voices limit (try 100)", default: "100" },
    voicesLanguage:  { label: "Voices language", hint: "Filter voices by language (en)", default: "en" },
    maxPages:        { label: "Max pages", hint: "Pagination safety cap", default: "20" },
    useCache:        { label: "Cache voices", hint: "true/false. Stores voices in a local json file.", default: "true" }
  },

  getAudio: function (text, locale, voice, speed, volume, pitch) {
    requireApiKey();

    let reqHeaders = {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "version": apiVersion,
      "Accept": (container === "mp3") ? "audio/mpeg" : "audio/wav"
    };

    let body = {
      model_id: modelId,
      transcript: text,
      voice: { mode: "id", id: voice },
      output_format: {
        container: container,
        encoding: encoding,
        sample_rate: sampleRate
      }
    };

    let resp = ttsrv.httpPost(baseUrl + "/text_to_speech", JSON.stringify(body), reqHeaders);

    if (resp.isSuccessful()) return resp.body().byteStream();
    throw "TTS FAILED: status=" + resp.code();
  }
};

// ---------- Voice dropdown ----------
let voicesData = null; // { voices: [...] }
let currentVoicesMap = new Map(); // voice_id -> full voice object

function fetchAllVoicesFromApi() {
  requireApiKey();

  let headers = {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "version": apiVersion
  };

  let all = [];
  let after = null;

  for (let page = 0; page < maxPages; page++) {
    let body = {
      limit: voicesPageLimit,
      language: voicesLanguage,   // e.g. "en"
      model_id: modelId           // e.g. "asyncflow_v2.0"
    };

    // Pagination: pass next_cursor back as "after"
    if (after) body.after = after;

    let resp = ttsrv.httpPost(baseUrl + "/voices", JSON.stringify(body), headers);
    if (!resp.isSuccessful()) throw "Voice list FAILED: status=" + resp.code();

    let jsonStr = resp.body().string();
    let obj = JSON.parse(jsonStr);

    if (obj && obj.voices && obj.voices.length) {
      for (let i = 0; i < obj.voices.length; i++) all.push(obj.voices[i]);
    }

    // next_cursor drives the next page
    after = obj ? obj.next_cursor : null;
    if (!after) break;
  }

  return { voices: all };
}

let EditorJS = {
  getAudioSampleRate: function (locale, voice) {
    return sampleRate;
  },

  getLocales: function () {
    if (!voicesData) {
      try { this.onLoadData(); } catch (e) { return ["Error - check API key"]; }
    }
    return ["Async.ai"];
  },

  getVoices: function (locale) {
    if (locale !== "Async.ai" || !voicesData || !voicesData.voices) return {};

    currentVoicesMap = new Map();
    let mm = {};

    voicesData.voices.forEach(function (v) {
      if (!v || !v.voice_id) return;

      currentVoicesMap.set(v.voice_id, v);

      // Label: Name (Gender, Accent, Style)
      let parts = [];
      if (v.gender) parts.push(v.gender);
      if (v.accent) parts.push(v.accent);
      if (v.style)  parts.push(v.style);
      // removed: voice_type

      let displayName = (v.name ? v.name : v.voice_id);
      if (parts.length) displayName += " (" + parts.join(", ") + ")";

      mm[v.voice_id] = new java.lang.String(displayName);
    });

    return mm;
  },

  onLoadData: function () {
    let cacheFileName = "asyncai_voices.json";

    if (useCache && ttsrv.fileExist(cacheFileName)) {
      let jsonStr = ttsrv.readTxtFile(cacheFileName);
      voicesData = JSON.parse(jsonStr);
      return;
    }

    voicesData = fetchAllVoicesFromApi();

    if (useCache) {
      ttsrv.writeTxtFile(cacheFileName, JSON.stringify(voicesData));
    }
  },

  onLoadUI: function (ctx, linearLayout) {}
};
