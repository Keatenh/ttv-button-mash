# Twitch Plays "Button Mash"

## Let Chat Spam your Keyboard
_TTV-Button-Mash allows you to use your twitch app to listen for a Channel Point Reward to spam a button on your keyboard to your specifications._

## Overview
TTV-Button-Mash as a very simple program inspired by more advanced projects like "TwitchPlaysPokemon". Its scope is limited to `reacting to channel point reward redemptions to press a single button`.   
This can allow a streamer to give their chat an easy & obvious interaction with _any_(👀 See Limitations) game or program, with control over the level of chaos via configs you speficify & the Channel Points system itself.

//TODO: [Insert GIF of program in action]

## Requirements, Limitations & Prerequisites

The program runs on Node.js and requires an LTS installation to work (v18 at time of writing).

The detection of game window only works on Windows, so this is the suggested environment to run ttv-bm.

So ideally -> Install node on your Windows system before continuing.

## Installation / Setup

### Twitch App
You will need to setup an application with Twitch on their developer console in your web browser.

### Variables
You will want to start exporting environment variables that will be used by the program into your terminal.  

Channel Variables:
```properties
TWITCH_CHANNEL //your channel name
TWITCH_CHANNEL_ID //your channel ID
TWITCH_REWARD_ID // Added later when you test a custom reward
```
App Variables:
```properties
// Found in twitch dev console
TWITCH_APP_CLIENT_ID 
TWITCH_APP_SECRET
```
### Tokens
Checkout the following links to see how to get the initially required tokens:
- https://twurple.js.org/docs/examples/chat/basic-bot.html

When authorizing your application, be sure to include the following scopes:  
`&scope=chat:read+chat:edit+channel:read:redemptions`   
as part of your request URL.

Download the ttv-button-mash repo & create a `tokens.json` file at the project root and give it your initial tokens, as seen in step 2 of:
- https://twurple.js.org/docs/auth/providers/refreshing.html
> IMPORTANT - Be sure not to expose this file (Or your environment variables) if you are using some kind of source control, double check your .gitignore, etc.

### Reward
Create a Custom Reward in the Channel Points section of your stream dashboard & enable it for testing in your chat.

### Configuration
Update src/config.ts in a text editor to your needs, following the commented descriptions.

A helpful 1st change would be to change `debug: true` in order to find the ID needed to set the `TWITCH_REWARD_ID` environment variable to the new reward you created.

The accepted Keys should be found here:  
- https://nut-tree.github.io/apidoc/enums/key_enum.Key.html

### Run
```Console
npx ts-node .\src\index.ts
```
You should see your join message from the config.ts file sent into the chat if you have a successful connection.

From here we can redeem the target reward while the program is listening to the channel events, and see the DEBUG logs with our reward info. Grab the `rewardId` & set `TWITCH_REWARD_ID` to use this value.

Open your game/program of choice & use the `window name` to set another variable:
```properties
TPBM_WINDOW_TITLE
```
Once this variable is set, the program should spam your button of choice, as long as you have the target window in focus.


## Use
1. Startup program using steps above
2. Chat redeems the target Channel Point Reward
3. When focused on target game/program, your target button will be repeatedly pressed to your specifications in the config file!
4. When you are done, shut down the program and repeat setup steps on next startup