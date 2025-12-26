// Async.ai TTS Plugin (MP3 output for ExoPlayer compatibility)
let apiKey     = ttsrv.userVars["apiKey"] || "empty-api-key";
let baseUrl    = ttsrv.userVars["baseUrl"] || "https://api.async.ai";
let apiVersion = ttsrv.userVars["apiVersion"] || "v1";
let modelId    = ttsrv.userVars["modelId"] || "asyncflow_v2.0";

let PluginJS = {
    name: 'Async.ai (MP3)',
    id: 'async.ai.tts.mp3',
    author: 'TTS Server (custom)',
    description: 'Async.ai text-to-speech via /text_to_speech (returns audio/mpeg)',
    version: 1,

    vars: {
        apiKey:     { label: "API-KEY", hint: "Async x-api-key" },
        baseUrl:    { label: "Base URL", hint: "https://api.async.ai", default: "https://api.async.ai" },
        apiVersion: { label: "API Version", hint: "Header: version (e.g. v1)", default: "v1" },
        modelId:    { label: "Model ID", hint: "e.g. asyncflow_v2.0", default: "asyncflow_v2.0" }
    },

    getAudio: function (text, locale, voice, speed, volume, pitch) {
        let reqHeaders = {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'version': apiVersion
        };

        let body = {
            model_id: modelId,
            transcript: text,
            voice: { mode: "id", id: voice }
            // Note: Docs show output_format here too, but this endpoint returns audio/mpeg (MP3) anyway.
        };

        let resp = ttsrv.httpPost(baseUrl + '/text_to_speech', JSON.stringify(body), reqHeaders);

        if (resp.isSuccessful()) {
            // MP3 bytes (audio/mpeg) – ExoPlayer should handle this fine.
            return resp.body().byteStream();
        } else {
            throw "FAILED: status=" + resp.code();
        }
    }
};

let EditorJS = {
    getAudioSampleRate: function (locale, voice) {
        // MP3 doesn't need a "declared" sample rate for playback; keep something sane.
        return 44100;
    },
    onLoadData: function () {},
    getLocales: function () { return ['en-US']; },
    getVoices: function (locale) {
        return {
            'e0f39dc4-f691-4e78-bba5-5c636692cc04': 'Async Voice (example) — e0f39dc4…'
        };
    },
    onLoadUI: function (ctx, linearLayout) {}
};
