import { API_URL } from '../config';

/**
 * Get project template based on user prompt
 */
export async function getProjectTemplate(prompt: string) {
  try {
    const response = await fetch(`${API_URL}/api/v1/gemini/template`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error('Failed to get project template');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting project template:', error);
    throw error;
  }
}

/**
 * Send chat message to the AI
 */
export async function sendChatMessage(messages: { role: string; content: string }[]) {
  try {
    // Transform messages to match the API schema
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    const response = await fetch(`${API_URL}/api/v1/gemini/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages: formattedMessages }),
    });

    if (!response.ok) {
      throw new Error('Failed to send chat message');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
} 