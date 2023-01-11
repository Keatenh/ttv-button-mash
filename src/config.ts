import { Key } from '@nut-tree/nut-js';

interface Config {
    debug: boolean, //For extra logging for setup / debugging
    tokenFile: string, //Path to tokens file from root
    key: Key, // Key you want pressed - https://nutjs.dev/API/keyboard
    delay: number, // How often you want key pressed, in milliseconds
    requestedPresses: number // How many times you want to mash button per request
    joinMsg: string; // Message sent to chat on connect
}

const config: Config = {
    debug: false, 
    tokenFile: './tokens.json',
    key: Key.H, 
    delay: 17, 
    requestedPresses: 100, 
    joinMsg:  "!twitchplays - Chat Assist Enabled MrDestructoid"
}

export default config;