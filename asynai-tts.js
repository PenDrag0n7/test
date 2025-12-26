// Async.ai TTS Plugin (streaming octet-stream audio)
let apiKey     = ttsrv.userVars["apiKey"] || "empty-api-key";
let baseUrl    = ttsrv.userVars["baseUrl"] || "https://api.async.ai";
let apiVersion = ttsrv.userVars["apiVersion"] || "v1";

let sampleRate = parseInt(ttsrv.userVars["sampleRate"]) || 44100;
let modelId    = ttsrv.userVars["modelId"] || "asyncflow_v2.0";

// Output format (per Async docs example)
let container  = ttsrv.userVars["container"] || "raw";
let encoding   = ttsrv.userVars["encoding"] || "pcm_f32le"; // docs example uses pcm_f32le

let PluginJS = {
    name: 'Async.ai',
    id: 'async.ai.tts',
    author: 'TTS Server (custom)',
    description: 'Async.ai text-to-speech streaming via /text_to_speech/streaming',
    version: 1,

    vars: {
        apiKey:      { label: "API-KEY", hint: "Async x-api-key" },
        baseUrl:     { label: "Base URL", hint: "https://api.async.ai", default: "https://api.async.ai" },
        apiVersion:  { label: "API Version", hint: "Send as header: version (e.g. v1)", default: "v1" },
        modelId:     { label: "Model ID", hint: "e.g. asyncflow_v2.0", default: "asyncflow_v2.0" },
        sampleRate:  { label: "Sample Rate", hint: "e.g. 44100", default: "44100" },
        container:   { label: "Container", hint: "raw (common for streaming)", default: "raw" },
        encoding:    { label: "Encoding", hint: "e.g. pcm_f32le, pcm_s16le (depends what your player supports)", default: "pcm_f32le" }
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

        let str = JSON.stringify(body);
        let resp = ttsrv.httpPost(baseUrl + '/text_to_speech/streaming', str, reqHeaders);

        if (resp.isSuccessful()) {
            // Returns application/octet-stream. Docs note quota errors may appear as bytes in-stream.
            // If your host lets you inspect bytes, you can optionally detect:
            // b"--ERROR:QUOTA_EXCEEDED--"
            return resp.body().byteStream();
        } else {
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
        return {
            // Put your Async voice IDs here (UUID strings)
            'e0f39dc4-f691-4e78-bba5-5c636692cc04': 'Async Voice (example) — e0f39dc4…'
        };
    },

    onLoadUI: function (ctx, linearLayout) {}
};
