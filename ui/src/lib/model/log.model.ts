export enum LogMessageType {
  DEBUG,
  INFO,
  WARNING,
  ERROR
}

export interface LogMessage {
  type: LogMessageType;
  message: string;
}
