# SMSAero TypeScript API client

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Модуль TypeScript для взаимодействия с API SMSAero.

## Предварительные условия

- Node.js
- TypeScript
- npm или yarn

## Установка

С npm:
```sh
npm install smsaero-ts
```

С yarn:
```sh
yarn add smsaero-ts
```

## Использование

```typescript
import { SmsAero, SmsAeroError, SmsAeroHTTPError } from 'smsaero-ts';

const client = new SmsAero({
  email: 'your@email.com',
  apiKey: 'your-api-key'
});
```

### Примеры

```typescript
// Отправка SMS
try {
  const response = await client.sendSms({
    number: 70000000000,
    text: 'Привет, мир!'
  });
  console.log(response);
} catch (error) {
  if (error instanceof SmsAeroError) {
    console.error('Ошибка SMSAero:', error.message);
  }
}

// Отправка Telegram кода
const telegram = await client.sendTelegram({
  number: 70000000000,
  code: 1234,
  sign: 'SMS Aero',
  text: 'Ваш код 1234'
});
console.log(telegram);

// Проверка баланса
const balance = await client.balance();
console.log(balance);
```

## Обработка ошибок

```typescript
try {
  const response = await client.sendSms({
    number: 70000000000,
    text: 'Привет, мир!'
  });
  console.log(response);
} catch (error) {
  if (error instanceof SmsAeroError) {
    console.error('Ошибка SMSAero:', error.message);
  } else if (error instanceof SmsAeroHTTPError) {
    console.error('HTTP ошибка:', error.message);
  } else {
    console.error('Неизвестная ошибка:', error);
  }
}
```

## Лицензия

[MIT](https://choosealicense.com/licenses/mit/)
