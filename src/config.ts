import config = require("config");

type Server = {
  port: number;
  host: string;
};

type JWT = {
  secretkey: string;
};


type frontend = {
  url: string;
};

type Stripe = {
  key: string;
  endPointSecret: string;
};

type DatabaseServer = {
  databaseName: string;
  username: string;
  password: string;
  url: string;
  hostname: string;
  schema: string;
};

type Airtable = {
  apiKey: string;
  baseId: string;
}

type mail = {
  apiKey: string;
}


export function getAirtableConfig() {
  const airtableConfig: Airtable = config.get("airtable");
  return airtableConfig;
}


export function getServerConfig() {
  const serverConfig: Server = config.get("server");
  return serverConfig;
}

export function getDatabaseConfig() {
  const databaseConfig: DatabaseServer = config.get("database");
  return databaseConfig;
}

export function getJWTConfig() {
  const jwtConfig: JWT = config.get("jwt");
  return jwtConfig;
}


export function getStripeConfig() {
  const stripeConfig: Stripe = config.get('stripe');
  return stripeConfig;
}

export function getFrontendConfig() {
  const frontendConfig: frontend = config.get('frontend');
  return frontendConfig;
}

export function getMailConfig() {
  const mailConfig: mail = config.get('mail')
  return mailConfig;
}