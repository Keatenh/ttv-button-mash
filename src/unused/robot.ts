/**
 * Reacts to emote combo messages in chat
 */

// Require necessary node modules
// Make the variables inside the .env element available to our Node project
import dotenv from 'dotenv';
import tmi from 'tmi.js';
import robot from 'robotjs';

dotenv.config();

/**
 * UTILITIES
 */

/**
 * Seems to be accurate within 2ms?
 * @param time 
 * @returns 
 */
function sleep(time: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, time));
}

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
const key = "h"; // Key you want pressed - http://robotjs.io/docs/syntax#keys

/**
 * Note with the following, we tend to log ~4.5 seconds pass per 100 frame delay attempts.
 * 4.5s*2^3 = 36s - so we can double it 3x before going over 30s => 3,4,5,6 streaks
 * 3str => 100f (4.5s) <1.6s  saved for 60fps>
 * 4str => 200f (9s)   <3.3s  saved>
 * 5str => 400f (18s)  <6.6s  saved>
 * 6str => 800f (36s)  <13.3s saved>
 * */ 
const delay = 25; // How often you want key pressed, in milliseconds
robot.setKeyboardDelay(delay)
const baseFrames = 100; // How many frames you want to save for 3x combo (or minstreak)
const minStreak = 3;
const maxStreak = 6;
let streakCap = minStreak;

// When the bot is on, it shall fetch the messages send by user from the specified channel
client.on('message', (channel, tags, message, self) => {
    // Lack of this statement or it's inverse (!self) will make it in active
    if (self) return;
    // Update chatter with every message -> Accept the last chatter that is not announcer as winner
    if (tags?.username !== comboAnnouncer) {
      winner = tags?.username || "";
    }

    /**
    * Reset (Streamer only)
    */ 
    if (message.toLowerCase() == "!reset" && tags.username === `${process.env.TWITCH_CHANNEL}`) {
      winner = "";
      highScore = 0;
      leader = "";
      client.say(channel, `Emote Combo scores have been reset. ${resetEmote} Chat Saved a total of: ${totalScore} frames!`);
      totalScore = 0;
    }
    /**
     * Test interaction
     */
    if (message.toLowerCase() == "!mash" && tags.username === `${process.env.TWITCH_CHANNEL}`) {
      //const start = Date.now();
      for (let i=0; i<baseFrames; i++) {
        const start = Date.now();
		robot.keyTap(key);
		console.log(`TEST done in ${Date.now()-start} milliseconds...`);
      }
      totalScore += baseFrames;
    }

    /**
    * Chat Announcements & Score Keeping
    */ 
   if (message.toLowerCase().startsWith("!combo") && tags.username === comboAnnouncer) {
      // Need to ignore parsing numbers in emote itself -> template is "!combo Nice 4x emoteName combo!""
      const streak = parseInt(message.split("x")[0].match(/\d/g)?.join("") || "0");
      const points = Math.min(streak, streakCap);
      const frames = (2 ** (points-minStreak))*baseFrames; //doubles for every streak past minimum, with a max
      totalScore += frames;
      const msg = `Combo Breaker @${winner} saved the run ${frames} frames!`
      client.say(channel, msg);
      if (streak >= streakCap) {
        const msg = streakCap === maxStreak ? `Hit the max emote streak of ${streakCap}x!` : `Hit the max emote streak of ${streakCap}x; Need a new leader for higher combos to count towards the run!`;
        client.say(channel, msg)
      }
      if (points > highScore) {
        const lastLeader = leader;
        leader = winner;
        // High Score only counts if you didnt just win it...
        if (leader !== lastLeader) {
          highScore = points;
          streakCap++
          const msg = streakCap < maxStreak ? `@${leader} is a new leader, with a streak of ${points}! Streaks of ${streakCap}x now count towards the run!` :`@${leader} has the current high score with a streak of ${points}!!!`;
          client.say(channel, msg);
        }
      }
      /**
       * Press Button based on current streak
       */
      for (let i=0; i<frames; i++) {
        robot.keyTap(key);
      }
    }
});

