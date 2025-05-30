let apiKey = ttsrv.userVars["apiKey"] || "empty-api-key"
let model = ttsrv.userVars["model"] || "tts-1"; // fallback to tts-1-hd

let PluginJS = {
    name: 'OpenAI-Compatible',
    id: 'openai.compatible.tts',
    author: 'TTS Server',
    description: 'Support Koroku TTS, Orpheus and other 3rd party',
    version: 1,

    vars: {
        apiKey: { label: "API-KEY", hint: "Your OpenAI API key" },
        model: { label: "Model (tts-1 or tts-1-hd)", hint: "Default is tts-1-hd" }
    },

    getAudio: function (text, locale, voice, speed, volume, pitch) {
        let reqHeaders = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey
        };

        let body = {
            model: model,
            input: text,
            voice: voice,
            speed: 1.0, // Fixed speed
            response_format: "aac"
        };

        let str = JSON.stringify(body);
        let resp = ttsrv.httpPost('http://192.168.0.80:5005/v1/audio/speech', str, reqHeaders);

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
            'leach': 'Leach (female)',
        };
    },

    onLoadUI: function (ctx, linearLayout) {}
};