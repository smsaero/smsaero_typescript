import axios, { AxiosInstance } from 'axios';
import {
  SmsAeroConfig,
  SendSMSParams,
  ContactParams,
  ViberParams,
  SmsAeroError,
  SmsAeroHTTPError,
  SmsListParams,
  BlacklistParams,
  HLRParams,
  FlashCallParams,
  BalanceAddParams,
  GroupParams,
  SignParams,
  SendTelegramParams,
  SendMobileIdParams,
  VerifyMobileIdParams
} from './types';

export class SmsAero {
  private email: string;
  private apiKey: string;
  private gateURLs: string[];
  private currentURLIndex: number = 0;
  private signature: string;
  private session: AxiosInstance;

  constructor({
    email,
    apiKey,
    signature = 'Sms Aero',
    gateURLs = [
      'https://gate.smsaero.ru/v2/',
      'https://gate.smsaero.org/v2/',
      'https://gate.smsaero.net/v2/',
      'https://gate.smsaero.uz/v2/',
    ],
  }: SmsAeroConfig) {
    this.email = email;
    this.apiKey = apiKey;
    this.gateURLs = gateURLs;
    this.signature = signature;
    this.session = axios.create({
      timeout: 30000,
    });
  }

  private async _request(selector: string, data: any = {}, page?: number): Promise<any> {
    for (let i = 0; i < this.gateURLs.length; i++) {
      const gate = this.gateURLs[(this.currentURLIndex + i) % this.gateURLs.length];
      let url = `${gate}${selector}`;
      if (page != null) {
        url += `?page=${page}`;
      }

      try {
        const response = await this.session.post(url, data, {
          auth: {
            username: this.email,
            password: this.apiKey,
          },
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'SmsAeroTS/1.0.0',
          },
        });
        this.currentURLIndex = 0;
        return this._checkResponse(response.data);
      } catch (err: any) {
        if (err instanceof SmsAeroError) throw err;

        if (
          i === this.gateURLs.length - 1 ||
          (err.response &&
            err.response.status < 500 &&
            err.response.status !== 429)
        ) {
          throw new SmsAeroHTTPError(err.message);
        }
      }
    }
  }

  private static _getNumber(number: number | number[]): [string, string | string[]] {
    if (Array.isArray(number)) {
      return ['numbers', number.map(String)];
    } else {
      return ['number', String(number)];
    }
  }

  private _checkResponse(response: any): any {
    if ('result' in response) {
      if (response.result === 'reject') {
        throw new SmsAeroError(response.reason || 'Request rejected');
      }
      if (response.result === 'no credits') {
        throw new SmsAeroError('No credits on the account');
      }
    }
    if (response.success === false) {
      throw new SmsAeroError(response.message || 'Unknown API error');
    }
    return response;
  }

  public async sendSms({ number, text, dateSend, callbackUrl }: SendSMSParams): Promise<any> {
    const [num, phoneNumber] = SmsAero._getNumber(number);
    const data: any = {
      [num]: phoneNumber,
      sign: this.signature,
      text: text,
      callbackUrl: callbackUrl,
    };

    if (dateSend) {
      if (dateSend instanceof Date) {
        data.dateSend = Math.floor(dateSend.getTime() / 1000);
      } else {
        throw new SmsAeroError('param `date` is not a Date object');
      }
    }

    return this._request('sms/send', data);
  }

  public async smsStatus(smsId: number): Promise<any> {
    return this._request('sms/status', { id: smsId });
  }

  public async smsList({ number, text, page }: SmsListParams = {}): Promise<any> {
    const data: Record<string, any> = {};
    if (number !== undefined) {
      data.number = String(number);
    }
    if (text !== undefined) {
      data.text = text;
    }
    return this._request('sms/list', data, page);
  }

  public async balance(): Promise<any> {
    return this._request('balance');
  }

  public async auth(): Promise<any> {
    return this._request('auth');
  }

  public async cards(): Promise<any> {
    return this._request('cards');
  }

  public async balanceAdd({ sum, cardId }: BalanceAddParams): Promise<any> {
    return this._request('balance/add', { sum, cardId });
  }

  public async tariffs(): Promise<any> {
    return this._request('tariffs');
  }

  public async signAdd({ name }: SignParams): Promise<any> {
    return this._request('sign/add', { name });
  }

  public async signList(page?: number): Promise<any> {
    return this._request('sign/list', null, page);
  }

  public async groupAdd({ name }: GroupParams): Promise<any> {
    return this._request('group/add', { name });
  }

  public async groupDelete(groupId: number): Promise<any> {
    return this._request('group/delete', { id: groupId });
  }

  public async groupList(page?: number): Promise<any> {
    return this._request('group/list', null, page);
  }

  public async contactAdd(params: ContactParams): Promise<any> {
    const data: Record<string, any> = {
      number: String(params.number),
      groupId: params.groupId,
      birthday: params.birthday,
      sex: params.sex,
      lname: params.lastName,
      fname: params.firstName,
      sname: params.surname,
      param1: params.param1,
      param2: params.param2,
      param3: params.param3,
    };

    Object.keys(data).forEach(key =>
      data[key] === undefined && delete data[key]
    );

    return this._request('contact/add', data);
  }

  public async contactDelete(contactId: number): Promise<any> {
    return this._request('contact/delete', { id: contactId });
  }

  public async contactList(params: Partial<ContactParams> & { page?: number } = {}): Promise<any> {
    const data: Record<string, any> = {
      number: params.number !== undefined ? String(params.number) : undefined,
      groupId: params.groupId,
      birthday: params.birthday,
      sex: params.sex,
      lname: params.lastName,
      fname: params.firstName,
      sname: params.surname,
    };

    Object.keys(data).forEach(key =>
      data[key] === undefined && delete data[key]
    );

    return this._request('contact/list', data, params.page);
  }

  public async blacklistAdd({ number }: BlacklistParams): Promise<any> {
    const [num, phoneNumber] = SmsAero._getNumber(number);
    return this._request('blacklist/add', { [num]: phoneNumber });
  }

  public async blacklistList(number?: number, page?: number): Promise<any> {
    const data = number !== undefined ? { number: String(number) } : null;
    return this._request('blacklist/list', data, page);
  }

  public async blacklistDelete(blacklistId: number): Promise<any> {
    return this._request('blacklist/delete', { id: Number(blacklistId) });
  }

  public async hlrCheck({ number }: HLRParams): Promise<any> {
    const [num, phoneNumber] = SmsAero._getNumber(number);
    return this._request('hlr/check', { [num]: phoneNumber });
  }

  public async hlrStatus(hlrId: number): Promise<any> {
    return this._request('hlr/status', { id: Number(hlrId) });
  }

  public async numberOperator(number: number | number[]): Promise<any> {
    const [num, phoneNumber] = SmsAero._getNumber(number);
    return this._request('number/operator', { [num]: phoneNumber });
  }

  public async viberSend(params: ViberParams): Promise<any> {
    const data: Record<string, any> = {
      groupId: params.groupId !== undefined ? Number(params.groupId) : undefined,
      sign: params.sign,
      channel: params.channel,
      text: params.text,
      imageSource: params.imageSource,
      textButton: params.textButton,
      linkButton: params.linkButton,
      dateSend: params.dateSend,
      signSms: params.signSms,
      channelSms: params.channelSms,
      textSms: params.textSms,
      priceSms: params.priceSms,
    };

    if (params.number) {
      const [num, phoneNumber] = SmsAero._getNumber(params.number);
      data[num] = phoneNumber;
    }

    Object.keys(data).forEach(key =>
      (data[key] === undefined || data[key] === null) && delete data[key]
    );

    return this._request('viber/send', data);
  }

  public async viberSignList(): Promise<any> {
    return this._request('viber/sign/list');
  }

  public async viberList(page?: number): Promise<any> {
    return this._request('viber/list', null, page);
  }

  public async viberStatistics(sendingId: number, page?: number): Promise<any> {
    return this._request('viber/statistic', { sendingId }, page);
  }

  public async sendTelegram({ number, code, sign, text }: SendTelegramParams): Promise<any> {
    const [num, phoneNumber] = SmsAero._getNumber(number);
    const data: Record<string, any> = {
      [num]: phoneNumber,
      code: Number(code),
    };
    if (sign !== undefined) data.sign = sign;
    if (text !== undefined) data.text = text;
    return this._request('telegram/send', data);
  }

  public async telegramStatus(telegramId: number): Promise<any> {
    return this._request('telegram/status', { id: telegramId });
  }

  public async sendMobileId({ number, sign, callbackUrl }: SendMobileIdParams): Promise<any> {
    return this._request('mobile-id/send', { number, sign, callbackUrl });
  }

  public async mobileIdStatus(reqId: number): Promise<any> {
    return this._request('mobile-id/status', { id: reqId });
  }

  public async verifyMobileId({ id, code, sign }: VerifyMobileIdParams): Promise<any> {
    return this._request('mobile-id/verify', { id, code, sign });
  }
}
