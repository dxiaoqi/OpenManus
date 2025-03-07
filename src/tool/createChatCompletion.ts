import { BaseTool } from './base';
import { LLM } from '../llm';
import { Message } from '../schema';
import logger from '../utils/logger';

/**
 * 创建聊天完成工具
 */
export class CreateChatCompletion extends BaseTool {
  private llm: LLM;

  constructor() {
    super(
      'create_chat_completion',
      'Create a chat completion using the LLM',
      {
        type: 'object',
        properties: {
          messages: {
            type: 'array',
            description: 'The messages to send to the LLM',
            items: {
              type: 'object',
              properties: {
                role: {
                  type: 'string',
                  enum: ['system', 'user', 'assistant']
                },
                content: {
                  type: 'string'
                }
              },
              required: ['role', 'content']
            }
          },
          model: {
            type: 'string',
            description: 'The model to use (optional)'
          },
          temperature: {
            type: 'number',
            description: 'The temperature to use (optional)'
          }
        },
        required: ['messages']
      }
    );

    this.llm = new LLM();
  }

  /**
   * 执行聊天完成
   */
  async execute(args: { 
    messages: Array<{role: string, content: string}>,
    model?: string,
    temperature?: number
  }): Promise<string> {
    try {
      logger.info('Creating chat completion with messages:', args.messages);

      // 转换消息格式
      const messages = args.messages.map(msg => {
        if (msg.role === 'system') {
          return Message.systemMessage(msg.content);
        } else if (msg.role === 'user') {
          return Message.userMessage(msg.content);
        } else if (msg.role === 'assistant') {
          return Message.assistantMessage(msg.content);
        }
        throw new Error(`Invalid message role: ${msg.role}`);
      });

      // 获取系统消息
      const systemMsgs = messages.filter(msg => msg.role === 'system');
      const otherMsgs = messages.filter(msg => msg.role !== 'system');

      // 执行 LLM 请求
      const response = await this.llm.ask(
        otherMsgs,
        systemMsgs.length > 0 ? systemMsgs : undefined,
        60,
        args.temperature
      );

      logger.info('Chat completion response:', response);
      return response;
    } catch (error) {
      logger.error('Error creating chat completion:', error);
      return `Error creating chat completion: ${error}`;
    }
  }
} 