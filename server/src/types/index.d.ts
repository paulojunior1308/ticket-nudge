declare module 'dotenv' {
  export function config(): void;
}

declare module 'cors' {
  import { RequestHandler } from 'express';
  const cors: () => RequestHandler;
  export default cors;
}

declare module '../lib/services/email' {
  export function checkAndSendReminders(): Promise<void>;
} 