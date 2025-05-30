let apiKey = ttsrv.userVars["apiKey"];
let model = ttsrv.userVars["model"] || "tts-1-hd"; // fallback to tts-1-hd

let PluginJS = {
    name: 'ChatGPT',
    id: 'speech.openai.com',
    author: 'TTS Server',
    description: 'OpenAI TTS with HD support',
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
        let resp = ttsrv.httpPost('https://api.openai.com/v1/audio/speech', str, reqHeaders);

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
            'nova': 'Nova (female)',
            'shimmer': 'Shimmer (female)',
            'onyx': 'Onyx (male)',
            'echo': 'Echo (male)',
            'fable': 'Fable (nonbinary)',
            'alloy': 'Alloy (male)'
        };
    },

    onLoadUI: function (ctx, linearLayout) {}
};
