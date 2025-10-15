export const API_CONFIG = {
  BASE_URL: __DEV__
    ? "http://192.168.1.21:5000/api"
    : "https://api.staytuned.com/api",
  WS_URL: __DEV__ ? "ws://192.168.1.21:5000" : "wss://api.staytuned.com",
  TIMEOUT: 30000,
};

export const LIMITS = {
  POST_CONTENT_MAX: 500,
  CHANNEL_NAME_MAX: 100,
  BIO_MAX: 500,
};

export const REACTION_TYPES = {
  HEART: "heart",
  CLAP: "clap",
  FIRE: "fire",
  HUNDRED: "hundred",
} as const;

export const REACTION_EMOJIS = {
  heart: "❤️",
  clap: "👏",
  fire: "🔥",
  hundred: "💯",
};
