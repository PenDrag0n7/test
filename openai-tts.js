let apiKey = ttsrv.userVars["apiKey"] || "empty-api-key";
let baseUrl = ttsrv.userVars["baseUrl"] || "http://192.168.0.80:5005"; // default URL

let PluginJS = {
    name: 'OpenAI-Compatible',
    id: 'openai.compatible.tts',
    author: 'TTS Server',
    description: 'Supports Koroko-TTS, Orpheus, and other OpenAI-compatible TTS APIs',
    version: 1,

    vars: {
        apiKey: { label: "API-KEY", hint: "Optional, depending on server" },
        baseUrl: { label: "Base URL", hint: "e.g. http://localhost:5005" }
    },

    getAudio: function (text, locale, voice, speed, volume, pitch) {
        let reqHeaders = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey
        };

        let body = {
            model: "tts-1", // Use model name expected by backend
            input: text,
            voice: voice,
            speed: 1.0,
            response_format: "aac"
        };

        let str = JSON.stringify(body);
        let resp = ttsrv.httpPost(baseUrl + '/v1/audio/speech', str, reqHeaders);

        if (resp.isSuccessful()) {
            return resp.body().byteStream();
        } else {
            throw "FAILED: status=" + resp.code();
        }
    }
};

let EditorJS = {
    getAudioSampleRate: function (locale, voice) {
        return 24000;
    },

    onLoadData: function () {},

    getLocales: function () {
        return ['en-US'];
    },

    getVoices: function (locale) {
        return {
            'tara': 'Tara (female)',
            'leach': 'Leach (female)'
        };
    },

    onLoadUI: function (ctx, linearLayout) {}
};
