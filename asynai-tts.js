// Async.ai TTS Plugin (streaming raw PCM)
let apiKey     = ttsrv.userVars["apiKey"] || "empty-api-key";
let baseUrl    = ttsrv.userVars["baseUrl"] || "https://api.async.ai";
let sampleRate = parseInt(ttsrv.userVars["sampleRate"]) || 44100;

let modelId    = ttsrv.userVars["modelId"] || "asyncflow_v2.0";

// Output format (matches the sample curl)
let container  = ttsrv.userVars["container"] || "raw";        // raw | (maybe wav, mp3 - depends on Async)
let encoding   = ttsrv.userVars["encoding"] || "pcm_s16le";   // pcm_s16le etc.

let PluginJS = {
    name: 'Async.ai',
    id: 'async.ai.tts',
    author: 'TTS Server (custom)',
    description: 'Async.ai text-to-speech via /text_to_speech/streaming',
    version: 1,

    vars: {
        apiKey:     { label: "API-KEY", hint: "Async.ai X-Api-Key" },
        baseUrl:    { label: "Base URL", hint: "https://api.async.ai", default: "https://api.async.ai" },
        modelId:    { label: "Model ID", hint: "e.g. asyncflow_v2.0", default: "asyncflow_v2.0" },
        sampleRate: { label: "Sample Rate", hint: "e.g. 44100", default: "44100" },
        container:  { label: "Container", hint: "raw (default). If your player needs wav/mp3, try those if Async supports it.", default: "raw" },
        encoding:   { label: "Encoding", hint: "pcm_s16le (default)", default: "pcm_s16le" }
    },

    // text, locale, voice, speed, volume, pitch are provided by host
    getAudio: function (text, locale, voice, speed, volume, pitch) {
        // Async.ai uses X-Api-Key (NOT Authorization: Bearer)
        let reqHeaders = {
            'Content-Type': 'application/json',
            'X-Api-Key': apiKey
        };

        // Host passes "voice" string; we treat it as Async voice "id"
        // (You can also implement "mode":"name" if Async supports it.)
        let body = {
            model_id: modelId,
            transcript: text,
            voice: {
                mode: "id",
                id: voice
            },
            output_format: {
                container: container,
                encoding: encoding,
                sample_rate: sampleRate
            }
        };

        // Optional: map host speed (if provided) to something you control.
        // Async sample doesn't show speed. If Async supports it, add it here.
        // Example:
        // if (typeof speed === "number" && !isNaN(speed)) body.speed = speed;

        let str = JSON.stringify(body);
        let resp = ttsrv.httpPost(baseUrl + '/text_to_speech/streaming', str, reqHeaders);

        if (resp.isSuccessful()) {
            // For container=raw, this is typically raw PCM bytes.
            return resp.body().byteStream();
        } else {
            // If Async returns useful error text, you may want resp.body().string() (if available in your host)
            throw "FAILED: status=" + resp.code();
        }
    }
};

let EditorJS = {
    getAudioSampleRate: function (locale, voice) {
        return sampleRate;
    },

    onLoadData: function () {},

    getLocales: function () {
        return ['en-US'];
    },

    getVoices: function (locale) {
        // Async voices are usually IDs (UUIDs). Put your real IDs here.
        // The "key" MUST be what you want passed into PluginJS.getAudio as `voice`.
        return {
            'e0f39dc4-f691-4e78-bba5-5c636692cc04': 'Async Voice (example) — e0f39dc4…'
            // Add more:
            // 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx': 'My Other Voice'
        };
    },

    onLoadUI: function (ctx, linearLayout) {}
};
