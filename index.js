const https = require('https');
const Alexa = require('alexa-sdk');
const APP_ID = '' ;
const clientid = process.env.clientid;

exports.handler = function (event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

function getStreams(callback) {
    https.get('https://api.twitch.tv/kraken/streams?client_id=' + clientid, (res) => {
        let data = []
        res.on('data', (d) => {
            data.push(d)
        });
        let speech = 'Hi, the top five twitch streamers at the moment are: '
        let streaminfo = ''
        res.on('end', (d) => {
            var result = JSON.parse(data.join(''))
            for (var i = 0; i < 5; i++) {
                let name = result.streams[i].channel.name
                let game = result.streams[i].channel.game
                name = name.replace(/&/g, "and")
                game = game.replace(/&/g, "and")
                if (i === 4) {
                    speech += "and " + name + ", streaming " + game + "."
                    break;
                }
                speech += name + ", streaming " + game + ", "
            }
            callback(speech)
        });
    }).on('error', (e) => {
        console.error(e);
    });
}
/*
getStreams(() => {
    console.log(speech)
})
*/
var handlers = {
    'LaunchRequest': function () {
        this.emit('GetTopStreamsIntent');
    },

    'GetTopStreamsIntent': function () {
        let self = this
        getStreams(function (speech) {
            self.emit(':ask', speech + " Would you like me to check again?")
        })
    },

    'AMAZON.NoIntent': function () {
        this.emit(':tell', "Okay, goodbye.");
    },

    'AMAZON.YesIntent': function () {
        this.emit('GetTopStreamsIntent');
    },

    'AMAZON.CancelIntent': function () {
        this.emit(":tell", "Okay, canceled.");
    },

    'AMAZON.HelpIntent': function () {
        var helpspeech = "Hi, ask something like what are the top twitch streams and I can get you the current top five streams."
        this.emit(':ask', helpspeech);
    },

    'AMAZON.StopIntent': function () {
        this.emit(':tell', "Goodbye");
    },

    'Unhandled': function () {
        this.emit(':ask', 'I didn\'t get that.');
    },

};

