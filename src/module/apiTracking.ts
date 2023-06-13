import axios from "axios";
import config from "../config";
import { logger } from "./winston";

const sendApiEvent = async (category: string) => {
  const body = {
    eventTimestamp: Date.now(),
    browser: {
      clientID: config.airbridgeClientId,
    },
    eventData: {
      shortID: "aef04",
      goal: {
        category,
        label: config.airbridgeLabel,
      },
    },
  };
  const head = {
    headers: { Authorization: `Bearer ${config.airbridgeToken}` },
  };
  try {
    const result = await axios.post(
      `https://api.airbridge.io/events/v1/apps/${config.airbridgeAppName}/web/9320`,
      body,
      head,
    );
    return result;
  } catch (error) {
    logger.error(error);
  }
};

export { sendApiEvent };
