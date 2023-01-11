/**
 * Reacts to specified mod messages in chat
 *  "tmi.js": "^1.8.5",
 *  "@types/tmi.js": "^1.8.2",
 */


// Require necessary node modules
// Make the variables inside the .env element available to our Node project
import dotenv from 'dotenv';
import tmi from 'tmi.js';
import { getActiveWindow, keyboard, Key } from '@nut-tree/nut-js';

dotenv.config();

// Setup connection configurations
// These include the channel, username and password
const client = new tmi.Client({
    options: { debug: true, messagesLogLevel: "info" },
    connection: {
        reconnect: true,
        secure: true
    },

    // Lack of the identity tags makes the bot anonymous and able to fetch messages from the channel
    // for reading, supervision, spying, or viewing purposes only
    identity: {
        username: `${process.env.TWITCH_USERNAME}`,
        password: `${process.env.TWITCH_OAUTH}`
    },
    channels: [`${process.env.TWITCH_CHANNEL}`]
});

// Connect to the channel specified using the setings found in the configurations
// Any error found shall be logged out in the console
client.connect().catch(console.error);

/**
 * High Score (Streak) & Total Score System
 */ 
const comboAnnouncer = "streamelements"
let winner = "";
let leader = "";
let highScore = 0;
let totalScore = 0;
const resetEmote = process.env.TWITCH_RESET_EMOTE || "";
const key = Key.H; // Key you want pressed - https://nutjs.dev/API/keyboard

/**
 * 100f (6.2s)   <1.6s  saved>
 * */ 
const delay = 17; // How often you want key pressed, in milliseconds
keyboard.config.autoDelayMs = delay;

const baseFrames = 100; // How many frames you want to save for 3x combo (or minstreak)
const minStreak = 3;
const maxStreak = 6;
let streakCap = minStreak;


// When the bot is on, it shall fetch the messages send by user from the specified channel
client.on('message', async (channel, tags, message, self) => {
    // Lack of this statement or it's inverse (!self) will make it in active
    if (self) return;
    // Update chatter with every message -> Accept the last chatter that is not announcer as winner
    if (tags?.username !== comboAnnouncer) {
      winner = tags?.username || "";
    }

    const modSent = client.isMod(process.env.TWITCH_CHANNEL || "", tags.username || "");

    /**
    * Reset
    */ 
    if (message.toLowerCase() == "!reset" && modSent) {
      winner = "";
      highScore = 0;
      leader = "";
      client.say(channel, `Scores have been reset. ${resetEmote} Chat Saved a total of: ${totalScore} frames!`);
      totalScore = 0;
    }
    /**
     * Main Interaction
     */
    if (message.toLowerCase() == "!mash" && !modSent) {
      client.say(channel, `@${tags.username} You can use channel points on "Button Mash" to do that :)`);
    }
    if (message.toLowerCase() == "!mash" && modSent) {
      const start = Date.now();
	  let presses = 0;
      for (let i=0; i<baseFrames; i++) {
		//DEBUG - Checking Window
		const windowRef = await getActiveWindow();
		const title = await Promise.resolve(windowRef.title);
		//const [title, region] = await Promise.all([windowRef.title, windowRef.region]);
		if (title === `${process.env.GAME_TITLE}`) {
			await keyboard.pressKey(key);
			await keyboard.releaseKey(key);
			presses++
		} else {
			console.log("Focus lost on target game, stopping button spam iteration...");
			break;
		}
      }
      console.log(`${presses} button presses done in ${Date.now()-start} milliseconds...`);
      totalScore += presses;
    }
});

