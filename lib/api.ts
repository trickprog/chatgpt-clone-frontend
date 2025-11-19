// API Service for communicating with backend
import { createClient } from '@/utils/supabase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Message {
  id: string;
  conversation_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

class ApiService {
  private async getAuthToken(): Promise<string | null> {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = await this.getAuthToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Conversation APIs
  async getConversations(): Promise<Conversation[]> {
    return this.fetchWithAuth('/api/conversations');
  }

  async createConversation(title?: string): Promise<Conversation> {
    return this.fetchWithAuth('/api/conversations', {
      method: 'POST',
      body: JSON.stringify({ title: title || 'New Conversation' }),
    });
  }

  async getConversation(id: string): Promise<Conversation> {
    return this.fetchWithAuth(`/api/conversations/${id}`);
  }

  async updateConversation(id: string, title: string): Promise<Conversation> {
    return this.fetchWithAuth(`/api/conversations/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title }),
    });
  }

  async deleteConversation(id: string): Promise<void> {
    return this.fetchWithAuth(`/api/conversations/${id}`, {
      method: 'DELETE',
    });
  }

  // Message APIs
  async getMessages(conversationId: string): Promise<Message[]> {
    return this.fetchWithAuth(`/api/messages/${conversationId}`);
  }

  async sendMessage(conversationId: string, content: string): Promise<{ message: Message; status: string }> {
    return this.fetchWithAuth(`/api/messages/${conversationId}`, {
      method: 'POST',
      body: JSON.stringify({ content, role: 'user' }),
    });
  }

  async deleteMessage(conversationId: string, messageId: string): Promise<void> {
    return this.fetchWithAuth(`/api/messages/${conversationId}/${messageId}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
export default apiService;
