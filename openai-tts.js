let apiKey = ttsrv.userVars["apiKey"] || "empty-api-key";
let baseUrl = ttsrv.userVars["baseUrl"] || "http://localhost:5005";
let sampleRate = parseInt(ttsrv.userVars["sampleRate"]) || 24000;

let PluginJS = {
    name: 'OpenAI-Compatible',
    id: 'openai.compatible.tts',
    author: 'TTS Server',
    description: 'Supports Koroko-TTS, Orpheus, and OpenAI-compatible TTS servers',
    version: 1,

    vars: {
        apiKey: { label: "API-KEY", hint: "Optional depending on server" },
        baseUrl: { label: "Base URL", hint: "e.g. http://localhost:5005" },
        sampleRate: { label: "Sample Rate", hint: "24000 or 44100", default: "24000" }
    },

    getAudio: function (text, locale, voice, speed, volume, pitch) {
        let reqHeaders = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey
        };

        let body = {
            model: "tts-1",
            input: text,
            voice: voice,
            speed: 1.0
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
        return sampleRate;
    },

    onLoadData: function () {},

    getLocales: function () {
        return ['en-US'];
    },

    getVoices: function (locale) {
        return {
            // Custom Koroko/Orpheus voices
            'tara': 'Tara — Female, conversational, clear',
            'leah': 'Leah — Female, warm, gentle',
            'jess': 'Jess — Female, energetic, youthful',
            'leo': 'Leo — Male, authoritative, deep',
            'dan': 'Dan — Male, friendly, casual',
            'mia': 'Mia — Female, professional, articulate',
            'zac': 'Zac — Male, enthusiastic, dynamic',
            'zoe': 'Zoe — Female, calm, soothing',

            // OpenAI-compatible voices
            'alloy': 'Alloy',
            'echo': 'Echo',
            'nova': 'Nova',
            'shimmer': 'Shimmer',
            'onyx': 'Onyx',
            'fable': 'Fable'
        };
    },

    onLoadUI: function (ctx, linearLayout) {}
};
