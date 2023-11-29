/**
 * Reacts to PubSub Messages, particularly Channel Point redeems
 */
import dotenv from "dotenv";
import fs from "fs";
import { RefreshingAuthProvider } from "@twurple/auth"; // StaticAuthProvider
import { ApiClient } from "@twurple/api";
import { EventSubWsListener } from "@twurple/eventsub-ws";
import { ChatClient } from "@twurple/chat";
import { getActiveWindow, keyboard } from "@nut-tree/nut-js";
import config from "./config";

/**
 * Sleep for X milliseconds
 * @param ms time to sleep in milliseconds
 * @returns
 */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  dotenv.config();

  /**
   * Setup Clients & WS Listener
   */
  const clientId = `${process.env.TWITCH_APP_CLIENT_ID}`;
  const clientSecret = `${process.env.TWITCH_APP_SECRET}`;
  // const accessToken = `${process.env.TWITCH_APP_ACCESS_TOKEN}`;
  // const authProvider = new StaticAuthProvider(clientId,accessToken);
  const tokenData = JSON.parse(fs.readFileSync(config.tokenFile, "utf8"));
  const authProvider = new RefreshingAuthProvider(
    {
      clientId,
      clientSecret,
      onRefresh: async (newTokenData) => {
        await fs.writeFile(
          config.tokenFile,
          JSON.stringify(newTokenData, null, 4),
          "utf8",
          (_err) => {}
        );
        console.log("[SYSTEM] - Credentials Refreshed!");
      },
    },
    tokenData
  );
  /**
   * Add
   * logger: {minLevel: 'debug'}
   * to any clients we want to debug
   */
  const apiClient = new ApiClient({
    authProvider,
  });
  const listener = new EventSubWsListener({
    apiClient,
  });
  await listener.start();
  console.log("Listener Started!");

  const channelName = `${process.env.TWITCH_CHANNEL}`;
  const chatClient = new ChatClient({
    authProvider,
    channels: [channelName],
  });
  await chatClient.connect();

  chatClient.onRegister(() => {
    chatClient.say(
      channelName,
      "!sh3 - Chat Assist Enabled MrDestructoid - Redeem 'Mash Button' to help save the run!"
    );
  });

  //TODO: Score Tracking
  //TODO: Reset Total Presses count
  //TODO: Interact with Reward Requests Queue?

  /**
   * Listen to Specific Channel Point Redeems
   */
  const channelId = `${process.env.TWITCH_CHANNEL_ID}`;
  const rewardId = `${process.env.TWITCH_REWARD_ID}`;
  //DEBUGGING
  if (config.debug) {
    await listener.subscribeToChannelRedemptionAddEvents(channelId, (e) => {
      console.log(`[DEBUG] rewardId: ${e.rewardId}`);
      console.log(`[DEBUG] rewardCost: ${e.rewardCost}`);
      console.log(`[DEBUG] rewardTitle: ${e.rewardTitle}`);
      console.log(`[DEBUG] status: ${e.status}`);
      console.log(`[DEBUG] userId: ${e.userId}`);
      console.log(`[DEBUG] userName: ${e.userName}`);
      console.log(`[DEBUG] userDisplayName: ${e.userDisplayName}`);
    });
  }

  // Specific Reward Redeem
  await listener.subscribeToChannelRedemptionAddEventsForReward(
    channelId,
    rewardId,
    async (event) => {
      console.log(`${event.userName} redeemed ${event.rewardTitle}`);

      keyboard.config.autoDelayMs = config.delay;

      const start = Date.now();
      if (config.mode === "TOGGLE") {
        if (!config.toggleKey) {
          throw new Error("Toggle Key is required for TOGGLE mode!");
        }
        await keyboard.pressKey(config.key);
        await keyboard.releaseKey(config.key);
        await sleep(config.toggleDuration || 1000);
        await keyboard.pressKey(config.toggleKey);
        await keyboard.releaseKey(config.toggleKey);
        console.log(`Event processed in ${Date.now() - start} milliseconds...`);
      } else {
        let presses = 0;
        for (let i = 0; i < (config.requestedPresses || 1); i++) {
          // Checking Window
          const windowRef = await getActiveWindow();
          const title = await Promise.resolve(windowRef.title);
          if (
            title === `${process.env.TPBM_WINDOW_TITLE}` ||
            process.env.TESTING_TTVBM === "true"
          ) {
            await keyboard.pressKey(config.key);
            await keyboard.releaseKey(config.key);
            presses++;
          } else {
            console.log("Focus lost on target game, stopping button spam...");
            break;
          }
        }
        console.log(
          `${presses} button presses done in ${
            Date.now() - start
          } milliseconds...`
        );
      }
    }
  );
}

main();
