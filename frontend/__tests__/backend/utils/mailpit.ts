/* 
This file is used to interact with Mailpit, a local SMTP server for testing.
It is a part of the supabase CLI
*/

const MAILPIT_API_URL = "http://localhost:54324/api/v1";

export interface MailpitMessage {
  ID: string;
  MessageID: string;
  Subject: string;
  To: { Name: string; Address: string }[];
  From: { Name: string; Address: string };
  Created: string;
  Snippet: string;
}

export interface MailpitMessageDetail extends MailpitMessage {
  HTML: string;
  Text: string;
}

export const deleteAllMessages = async (): Promise<void> => {
  const response = await fetch(`${MAILPIT_API_URL}/messages`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Failed to delete messages: ${response.statusText}`);
  }
};

export const getAllMessages = async (): Promise<MailpitMessage[]> => {
  const response = await fetch(`${MAILPIT_API_URL}/messages`);
  if (!response.ok) {
    throw new Error(`Failed to fetch messages: ${response.statusText}`);
  }
  const data = await response.json();
  return data.messages || [];
};

export const getMessageContent = async (
  id: string,
): Promise<MailpitMessageDetail> => {
  const response = await fetch(`${MAILPIT_API_URL}/message/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch message content: ${response.statusText}`);
  }
  return response.json();
};

export const findLatestEmail = async (
  toEmail: string,
): Promise<MailpitMessageDetail | null> => {
  const messages = await getAllMessages();
  const userMessages = messages.filter((msg) =>
    msg.To.some((recipient) => recipient.Address === toEmail),
  );

  if (userMessages.length === 0) {
    return null;
  }
  return getMessageContent(userMessages[0].ID);
};

export const extractCodeFromEmail = (htmlContent: string): string | null => {
  // Look for a 6 digit code
  const codeRegex = /enter the code: (\d{6})/;
  const codeMatch = htmlContent.match(codeRegex);
  if (codeMatch && codeMatch[1]) {
    return codeMatch[1];
  }
  return null;
};
