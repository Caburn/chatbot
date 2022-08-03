const tmi = require('tmi.js');
require('dotenv').config();

// Retrieve configuration options from .env file
const opts = {
    identity: {
      username: process.env.BOT_USERNAME,
      password: process.env.OAUTH_TOKEN
    },
    // Use JSON.parse to convert the string of channels into a javascript object
    channels: JSON.parse(process.env.CHANNELS_LIST)
};

// Create a tmi client using the configuration 
const client = new tmi.client(opts);

// Register event handlers & connect
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);
client.connect();

// Function triggered by new message
function onMessageHandler (channel, tags, message, self) {
    // Don't continue if the message is from the bot itself or doesn't start with an !
    if(self || !message.startsWith('!')) return;

    // Split message to command and args
    const args = message.slice(1).split(' ');
    const command = args.shift().toLowerCase();

    // !commands tells the user what bot commands are available
    if(ifsList(command, ['commands'])) {
        client.say(channel, `/me @${tags['display-name']}, available commands are: !so !treasure !ctof !ftoc !8ball}`);
    }

    // !so shoutout command to link viewers to another channel#
    else if(ifsList(command, ['so', 'shoutout'])) {
        client.say(channel, `/me Check out ${args[0].replace('@', '')} over at twitch.tv/${args[0].replace('@', '')} :)`);
    }

    // !treasure replies with the location of the buried treasure
    else if(ifsList(command, ['treasure'])) {
        client.say(channel, `/me @${tags['display-name']}, ${calcTreasure(args[0])}, ${calcTreasure(args[1])}`);
    }

    // !ctof and !ftoc convert temperature between fahrenheit and celsius 
    else if (ifsList(command, ['ctof'])) {
        const num = cToF(args[0]);
        client.say(channel, `/me ${args[0]}°C is ${num}°F`);
    }   
    else if (ifsList(command, ['ftoc'])) {
        const num = fToC(args[0]);
        client.say(channel, `/me ${args[0]}°F is ${num}°C`);
    }  

    // !8ball eightball game to help make a decision or answer a question
    else if (ifsList(command, ['8ball', 'eightball'])) {
        // List of potential replies
        const replies = [
            "It is certain.",
            "It is decidedly so.",
            "Without a doubt.",
            "Yes – definitely.",
            "You may rely on it.",
            "As I see it, yes.",
            "Most likely.",
            "Outlook good.",
            "Yes.",
            "Signs point to yes.",
            "Reply hazy, try again.",
            "Ask again later.",
            "Better not tell you now.",
            "Cannot predict now.",
            "Concentrate and ask again.",
            "Don't count on it.",
            "My reply is no.",
            "My sources say no.",
            "Outlook not so good.",
            "Very doubtful."
        ];
        client.say(channel, `/me @${tags['display-name']}: ${replies[Math.floor(Math.random() * replies.length)]}`);
    }

    // Log any unknown commands
    else {
        console.log(`[${timeNow()}] Unknown command "${command}" with args: "${args}"`);
    }
}

// Return current time in hours:minutes as a string
function timeNow() {
    var now = new Date();
    return `${now.getHours()}:${now.getMinutes()}` 
}


// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
    console.log(`[${timeNow()}] Connected to ${addr}:${port}`);
}

// Returns true if the 1st arg is in within the list of the 2nd arg
function ifsList (arg, array) {
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        if (arg === element) {
            return true
        }
    }
    return false
}

// Temperature conversions
function cToF(celsius) {
    return (celsius * 9 / 5 + 32).toPrecision(3);
}
function fToC(fahrenheit) {
    return ((fahrenheit - 32) * 5 / 9).toPrecision(3);
}

// Minecraft buried treasure chunk calculation
function calcTreasure(x) {
    return (Math.floor(x / 16) + 0.5) * 16;
}
  