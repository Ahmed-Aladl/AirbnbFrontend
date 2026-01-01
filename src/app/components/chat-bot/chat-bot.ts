import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { ChatContextService } from '../../core/chatbot/chat-context.service';
import { marked } from 'marked';
import { LangService } from '../../core/services/lang.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-chat-bot',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './chat-bot.html',
  styleUrls: ['./chat-bot.css']
})
export class ChatBot implements OnInit, OnDestroy {
  isOpen = false;
  messages: ChatMessage[] = [];
  userInput = '';
  isLoading = false;
  showQuickActions = true;
  private langChangeSubscription?: Subscription;

  private readonly API_URL = environment.baseUrl + '/chatbot/chat';
  private readonly http = inject(HttpClient);
  private readonly contextService = inject(ChatContextService);

  quickActions = [
    { text: '🏠 Find a place', action: 'I want to find a place to stay' },
    { text: '📅 Check availability', action: 'Is this property available on certain dates?' },
    { text: '💰 Pricing info', action: 'What is the price for 3 nights?' },
  ];

  constructor(public lang: LangService, private translate: TranslateService) {
  }

  ngOnInit() {
    this.langChangeSubscription = this.translate.onLangChange.subscribe(() => {
      this.reinitializeChat();
    });

    this.initializeChat();
  }

  ngOnDestroy() {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

  private initializeChat() {
    this.translate.get([
      'CHAT.welcome',
      'CHAT.quick.find_place',
      'CHAT.quick.check_availability',
      'CHAT.quick.pricing'
    ]).subscribe(translations => {
      if (this.messages.length === 0) {
        this.addMessage('assistant', translations['CHAT.welcome']);
      }

      this.quickActions = [
        { text: translations['CHAT.quick.find_place'], action: 'I want to find a place to stay' },
        { text: translations['CHAT.quick.check_availability'], action: 'Is this property available on certain dates?' },
        { text: translations['CHAT.quick.pricing'], action: 'What is the price for 3 nights?' }
      ];
    });
  }

  private reinitializeChat() {
    this.translate.get([
      'CHAT.welcome',
      'CHAT.quick.find_place',
      'CHAT.quick.check_availability',
      'CHAT.quick.pricing'
    ]).subscribe(translations => {
      if (this.messages.length > 0 && this.messages[0].role === 'assistant') {
        this.messages[0].content = translations['CHAT.welcome'];
      }

      this.quickActions = [
        { text: translations['CHAT.quick.find_place'], action: 'I want to find a place to stay' },
        { text: translations['CHAT.quick.check_availability'], action: 'Is this property available on certain dates?' },
        { text: translations['CHAT.quick.pricing'], action: 'What is the price for 3 nights?' }
      ];
    });
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    setTimeout(() => this.scrollToBottom(), 100);
  }

  closeChat() {
    this.isOpen = false;
  }

  clearChat() {
    this.messages = [];
    this.translate.get('CHAT.cleared').subscribe((res) => {
      this.addMessage('assistant', res);
    });
    this.showQuickActions = true;
  }

  async sendMessage() {
    if (!this.userInput.trim() || this.isLoading) return;

    const message = this.userInput.trim();
    this.userInput = '';
    this.addMessage('user', message);
    this.isLoading = true;

    try {
      const context = this.contextService.getContext();

      const body = {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant on an Airbnb-like platform. Use only the provided context below to answer the user:\n\n${context}`
          },
          ...this.messages
            .filter(msg => msg.content.trim() !== '')
            .slice(-10)
            .map(msg => ({
              role: msg.role,
              content: msg.content
            }))
        ],
        max_tokens: 150,
        temperature: 0.9
      };

      const response = await this.http.post<any>(this.API_URL, body).toPromise();

      const reply = response?.choices?.[0]?.message?.content;
      if (reply) {
        const htmlReply = await marked(reply);
        this.addMessage('assistant', htmlReply);
      } else {
        throw new Error('No valid reply from assistant');
      }
    } catch (error) {
      console.error('❌ API Error:', error);
      this.translate.get('CHAT.error').subscribe((res) => {
        this.addMessage('assistant', res);
      });
    } finally {
      this.isLoading = false;
    }
  }

  handleQuickAction(action: string) {
    this.userInput = action;
    this.sendMessage();
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private addMessage(role: 'user' | 'assistant', content: string) {
    this.messages.push({
      role,
      content,
      timestamp: new Date()
    });

    if (role === 'user' && this.messages.filter(m => m.role === 'user').length > 0) {
      this.showQuickActions = false;
    }

    setTimeout(() => this.scrollToBottom(), 100);
  }

  private scrollToBottom() {
    const container = document.querySelector('.CHAT-messages');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }
}
