export interface SmsAeroConfig {
  email: string;
  apiKey: string;
  signature?: string;
  gateURLs?: string[];
}

export interface SendSMSParams {
  number: number | number[];
  text: string;
  dateSend?: Date;
  callbackUrl?: string;
}

export interface ContactParams {
  number: number | number[];
  groupId?: number;
  birthday?: string;
  sex?: string;
  lastName?: string;
  firstName?: string;
  surname?: string;
  param1?: string;
  param2?: string;
  param3?: string;
}

export interface ViberParams {
  sign: string;
  channel: string;
  text: string;
  number?: number | number[];
  groupId?: number;
  imageSource?: string;
  textButton?: string;
  linkButton?: string;
  dateSend?: string;
  signSms?: string;
  channelSms?: string;
  textSms?: string;
  priceSms?: number;
}

export interface SmsStatusParams {
  id: number;
}

export interface SmsListParams {
  number?: number;
  text?: string;
  page?: number;
}

export interface BlacklistParams {
  number: number | number[];
}

export interface HLRParams {
  number: number | number[];
}

export interface FlashCallParams {
  phone: number;
  code: number;
}

export interface BalanceAddParams {
  sum: number;
  cardId: number;
}

export interface GroupParams {
  name: string;
}

export interface SignParams {
  name: string;
}

export interface SendTelegramParams {
  number: number | number[];
  code: number;
  sign?: string;
  text?: string;
}

export interface SendMobileIdParams {
  number: string;
  sign: string;
  callbackUrl: string;
}

export interface VerifyMobileIdParams {
  id: number;
  code: string;
  sign: string;
}

export class SmsAeroError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SmsAeroError';
  }
}

export class SmsAeroHTTPError extends SmsAeroError {
  constructor(message: string) {
    super(message);
    this.name = 'SmsAeroHTTPError';
  }
}
