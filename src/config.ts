import { Key } from '@nut-tree/nut-js';

interface Config {
    debug: boolean, //For extra logging for setup / debugging
    tokenFile: string, //Path to tokens file from root
    key: Key, // Key you want pressed - https://nutjs.dev/API/keyboard
    delay: number, // How often you want key pressed, in milliseconds
    requestedPresses?: number // How many times you want to mash button per request, required if mode is set to MASH
    joinMsg: string; // Message sent to chat on connect
    mode?: "MASH" | "TOGGLE"; // Mode to run in, defaults to mash
    toggleKey?: Key; // Key to press to toggle off, required if mode is set to TOGGLE
    toggleDuration?: number; // How long to wait between key presses for toggle mode, in milliseconds
}

const config: Config = {
    debug: false, 
    tokenFile: './tokens.json',
    key: Key.Multiply, //Key.H
    delay: 17, 
    // requestedPresses: 100,
    joinMsg:  "!twitchplays - Chat Assist Enabled MrDestructoid",
    mode: "TOGGLE",
    toggleKey: Key.Divide,
    toggleDuration: 3000,
}

export default config;