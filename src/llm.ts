import { LLMSettings, config } from './config';
import { Message } from './schema';
import logger from './utils/logger';

/**
 * OpenAI API 响应接口
 */
interface OpenAIResponse {
  choices: {
    message: {
      content: string | null;
      tool_calls?: any[];
    };
  }[];
}

/**
 * 聊天完成消息接口
 */
export interface ChatCompletionMessage {
  content: string | null;
  tool_calls?: any[];
}

/**
 * LLM 类，用于与语言模型交互
 */
export class LLM {
  private static instances: Record<string, LLM> = {};
  private model: string;
  private maxTokens: number;
  private temperature: number;
  private apiKey: string;
  private baseUrl: string;

  /**
   * 构造函数
   */
  constructor(configName: string = 'default', llmConfig?: LLMSettings) {
    const settings = llmConfig || config.llm[configName] || config.llm['default'];
    
    this.model = settings.model;
    this.maxTokens = settings.maxTokens;
    this.temperature = settings.temperature;
    this.apiKey = settings.apiKey;
    this.baseUrl = settings.baseUrl;
  }

  /**
   * 获取 LLM 实例
   */
  static getInstance(configName: string = 'default', llmConfig?: LLMSettings): LLM {
    if (!this.instances[configName]) {
      this.instances[configName] = new LLM(configName, llmConfig);
    }
    return this.instances[configName];
  }

  /**
   * 格式化消息
   */
  static formatMessages(messages: (Record<string, any> | Message)[]): Record<string, any>[] {
    const formattedMessages: Record<string, any>[] = [];
    let lastAssistantMessage: Record<string, any> | null = null;

    for (const message of messages) {
      let formattedMsg: Record<string, any>;

      if (message instanceof Message) {
        formattedMsg = { role: message.role };

        if (message.content !== null) {
          formattedMsg.content = message.content;
        }

        if (message.role === 'assistant' && message.toolCalls) {
          formattedMsg.tool_calls = message.toolCalls;
          lastAssistantMessage = formattedMsg;
        } else if (message.role === 'tool') {
          if (!message.toolCallId || !message.name) {
            logger.warning('Skipping invalid tool message');
            continue;
          }
          if (!lastAssistantMessage?.tool_calls) {
            logger.warning('Tool message without preceding assistant message');
            continue;
          }
          formattedMsg.tool_call_id = message.toolCallId;
          formattedMsg.name = message.name;
        }
      } else {
        if (!message.role) {
          throw new Error('Message must have a role');
        }
        formattedMsg = { ...message };

        if (message.role === 'assistant' && message.tool_calls) {
          lastAssistantMessage = formattedMsg;
        }
      }

      formattedMessages.push(formattedMsg);
    }

    return formattedMessages;
  }

  /**
   * 发送普通请求
   */
  async ask(
    messages: (Record<string, any> | Message)[],
    systemMsgs?: (Record<string, any> | Message)[],
    timeout: number = 60,
    temperature?: number,
    ...args: any[]
  ): Promise<string> {
    try {
      const formattedMessages = systemMsgs 
        ? [...LLM.formatMessages(systemMsgs), ...LLM.formatMessages(messages)]
        : LLM.formatMessages(messages);

      const response = await this.callOpenAI({
        model: this.model,
        messages: formattedMessages,
        temperature: temperature || this.temperature,
        max_tokens: this.maxTokens,
        ...args
      });

      if (!response.choices?.[0]?.message?.content) {
        throw new Error('Invalid or empty response from LLM');
      }

      return response.choices[0].message.content;
    } catch (error) {
      logger.error(`Error in ask: ${error}`);
      throw error;
    }
  }

  /**
   * 发送工具调用请求
   */
  async askTool(
    messages: (Record<string, any> | Message)[],
    systemMsgs?: (Record<string, any> | Message)[],
    timeout: number = 60,
    tools?: Record<string, any>[],
    toolChoice: 'none' | 'auto' | 'required' = 'auto',
    temperature?: number,
    ...args: any[]
  ): Promise<ChatCompletionMessage> {
    try {
      const formattedMessages = systemMsgs 
        ? [...LLM.formatMessages(systemMsgs), ...LLM.formatMessages(messages)]
        : LLM.formatMessages(messages);

      const params: Record<string, any> = {
        model: this.model,
        messages: formattedMessages,
        temperature: temperature || this.temperature,
        max_tokens: this.maxTokens,
        ...args
      };

      // 只有在提供了工具时才添加工具相关参数
      if (tools && tools.length > 0) {
        params.tools = tools;
        if (toolChoice !== 'none') {
          params.tool_choice = toolChoice;
        }
      }

      const response = await this.callOpenAI(params);

      if (!response.choices?.[0]?.message) {
        throw new Error('Invalid or empty response from LLM');
      }

      return response.choices[0].message;
    } catch (error) {
      logger.error(`Error in askTool: ${error}`);
      throw error;
    }
  }

  /**
   * 调用 OpenAI API
   */
  private async callOpenAI(params: Record<string, any>): Promise<OpenAIResponse> {
    try {
      console.log(params);
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`OpenAI API error: ${errorData}`);
      }

      return await response.json();
    } catch (error) {
      logger.error(`API call failed: ${error}`);
      throw error;
    }
  }
} 