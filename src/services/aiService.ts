import { documentService } from './documentService';
import { locationService } from './locationService';
import { api } from './api';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  actionSuggestions?: { label: string; action: string }[];
  isEmergencyAlert?: boolean;
}

interface AiConversationResponse {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface AiMessageResponse {
  id: string;
  conversationId: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  actionSuggestionsJson?: string;
  emergencyAlert?: boolean;
  createdAt: string;
}

interface AiChatApiResponse {
  conversationId: string;
  message: AiMessageResponse;
  mode?: 'ai' | 'fallback' | 'safety';
}

class AiService {
  private currentConversationId: string | null = null;

  /** Load the user's most recent AI conversation from the backend. */
  async loadHistory(userId: string): Promise<ChatMessage[]> {
    try {
      const conversationsResponse = await api.get<AiConversationResponse[]>('/ai/conversations');
      const conversations = conversationsResponse.data || [];
      let conversation = conversations[0];

      if (!conversation) {
        const created = await api.post<AiConversationResponse>('/ai/conversations', {
          title: 'Health Assistant Chat'
        });
        conversation = created.data;
      }

      this.currentConversationId = conversation.id;
      const messagesResponse = await api.get<AiMessageResponse[]>(
        `/ai/conversations/${encodeURIComponent(conversation.id)}/messages`
      );

      return (messagesResponse.data || []).map(message => this.fromApiMessage(message));
    } catch (error) {
      console.warn('Could not load AI conversation history:', error);
      this.currentConversationId = null;
      return [];
    }
  }

  private async ensureConversation(): Promise<string> {
    if (this.currentConversationId) return this.currentConversationId;

    const response = await api.get<AiConversationResponse[]>('/ai/conversations');
    const conversations = response.data || [];
    if (conversations.length > 0) {
      this.currentConversationId = conversations[0].id;
      return this.currentConversationId;
    }

    const created = await api.post<AiConversationResponse>('/ai/conversations', {
      title: 'Health Assistant Chat'
    });
    this.currentConversationId = created.data.id;
    return this.currentConversationId;
  }

  async saveMessage(message: ChatMessage): Promise<ChatMessage> {
    const conversationId = await this.ensureConversation();
    const response = await api.post<AiMessageResponse>(
      `/ai/conversations/${encodeURIComponent(conversationId)}/messages`,
      {
        sender: message.sender,
        text: message.text,
        timestamp: message.timestamp,
        actionSuggestionsJson: JSON.stringify(message.actionSuggestions || []),
        emergencyAlert: Boolean(message.isEmergencyAlert)
      }
    );
    return this.fromApiMessage(response.data);
  }

  private fromApiMessage(message: AiMessageResponse): ChatMessage {
    let actionSuggestions: { label: string; action: string }[] | undefined;
    if (message.actionSuggestionsJson) {
      try {
        const parsed = JSON.parse(message.actionSuggestionsJson);
        if (Array.isArray(parsed)) {
          actionSuggestions = parsed.filter(
            item => item && typeof item.label === 'string' && typeof item.action === 'string'
          );
        }
      } catch {
        actionSuggestions = undefined;
      }
    }

    return {
      id: message.id,
      sender: message.sender,
      text: message.text,
      timestamp: message.timestamp,
      actionSuggestions,
      isEmergencyAlert: message.emergencyAlert
    };
  }

  /**
   * Safe AI Assistant with strict clinical guardrails and grounded document context
   */
  async sendMessage(query: string, userId: string): Promise<ChatMessage> {
    const text = query.trim();
    if (!text) throw new Error('Please enter a message.');

    try {
      const conversationId = await this.ensureConversation();
      const response = await api.post<AiChatApiResponse>('/ai/chat', {
        conversationId,
        message: text
      });

      this.currentConversationId = response.data.conversationId;
      return this.fromApiMessage(response.data.message);
    } catch (error) {
      // Keep the app usable even when the backend/AI service is unavailable.
      // The frontend fallback is intentionally limited to non-diagnostic guidance.
      console.warn('Backend AI unavailable; using safe local fallback:', error);
      return this.safeLocalFallback(text);
    }
  }

  private safeLocalFallback(query: string): ChatMessage {
    const lower = query.toLowerCase();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const emergencyTerms = ['chest pain', 'cannot breathe', "can't breathe", 'severe bleeding', 'unconscious', 'stroke', 'seizure', 'heart attack'];
    if (emergencyTerms.some(term => lower.includes(term))) {
      return {
        id: `msg_${Date.now()}`,
        sender: 'ai',
        isEmergencyAlert: true,
        text: '🚨 **Potential medical emergency detected**\n\nPlease call **112** or go to the nearest emergency department immediately. This chat cannot assess or treat a medical emergency.',
        timestamp,
        actionSuggestions: [
          { label: 'Call 112 Emergency', action: 'navigate:emergency' },
          { label: 'Find Emergency Hospital', action: 'navigate:healthcare?filter=Emergency' }
        ]
      };
    }
    if (lower.includes('appointment')) {
      return {
        id: `msg_${Date.now()}`,
        sender: 'ai',
        text: 'I can check your saved appointments when the backend is available. You can also open the Appointments section to view or manage them.',
        timestamp,
        actionSuggestions: [{ label: 'View My Appointments', action: 'navigate:appointments' }]
      };
    }
    if (lower.includes('medicine') || lower.includes('prescription') || lower.includes('report')) {
      return {
        id: `msg_${Date.now()}`,
        sender: 'ai',
        text: 'I can explain your saved medical records when the backend is available. Open Medical Documents to review your latest prescription or report.',
        timestamp,
        actionSuggestions: [{ label: 'Open Medical Documents', action: 'navigate:documents' }]
      };
    }
    return {
      id: `msg_${Date.now()}`,
      sender: 'ai',
      text: 'I can help explain medical terms, review information recorded in your account, help with appointments, and suggest which type of department may be relevant. I do not diagnose conditions or change treatment plans.',
      timestamp
    };
  }
}

export const aiService = new AiService();
