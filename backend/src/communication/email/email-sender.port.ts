export interface EmailSender {
  send(input: {
    to: string;
    subject: string;
    template: string;
    variables: Record<string, string>;
  }): Promise<void>;
}
