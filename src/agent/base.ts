/**
 * Base Agent class for the TypeScript implementation
 * Converted from the Python version
 */

import { LLM } from '../llm';
import { AgentState, Memory, Message } from '../schema';
import logger  from '../utils/logger';

/**
 * Base Agent class for the TypeScript implementation
 * Converted from the Python version
 */

export interface AgentConfig {
  name: string;
  description?: string;
  systemPrompt?: string;
  nextStepPrompt?: string;
  maxSteps?: number;
  [key: string]: any;
}

export interface AgentContext {
  [key: string]: any;
}

export abstract class BaseAgent {
  protected name: string;
  protected description: string;
  protected systemPrompt?: string;
  protected nextStepPrompt?: string;
  protected llm: LLM;
  protected memory: Memory;
  protected state: AgentState;
  protected maxSteps: number;
  protected currentStep: number;
  protected duplicateThreshold: number;

  constructor(config: AgentConfig, context: AgentContext = {}) {
    this.name = config.name;
    this.description = config.description || '';
    this.systemPrompt = config.systemPrompt;
    this.nextStepPrompt = config.nextStepPrompt;
    this.maxSteps = config.maxSteps || 10;
    this.currentStep = 0;
    this.duplicateThreshold = 2;

    this.llm = new LLM();
    this.memory = new Memory();
    this.state = AgentState.IDLE;
  }

  /**
   * Initialize the agent
   */
  async initialize(): Promise<void> {
    logger.info(`Initializing agent: ${this.name}`);
  }

  /**
   * Run the agent with the given input
   * @param input The input data for the agent
   * @returns The result of the agent's processing
   */
  async run(request?: string): Promise<string> {
    if (this.state !== AgentState.IDLE) {
      throw new Error(`Cannot run agent from state: ${this.state}`);
    }

    if (request) {
      this.updateMemory('user', request);
    }

    const results: string[] = [];
    this.state = AgentState.RUNNING;

    try {
      while (this.currentStep < this.maxSteps && this.state === AgentState.RUNNING) {
        this.currentStep++;
        logger.info(`Executing step ${this.currentStep}/${this.maxSteps}`);
        const stepResult = await this.step();

        // 检查是否陷入循环
        if (this.isStuck()) {
          this.handleStuckState();
        }

        results.push(`Step ${this.currentStep}: ${stepResult}`);
      }

      if (this.currentStep >= this.maxSteps) {
        results.push(`Terminated: Reached max steps (${this.maxSteps})`);
      }

      return results.join('\n') || 'No steps executed';
    } finally {
      this.state = AgentState.IDLE;
    }
  }

  /**
   * Execute a single step of the agent
   */
  protected abstract step(): Promise<string>;

  /**
   * Handle the agent's stuck state
   */
  protected handleStuckState(): void {
    const stuckPrompt = 'Observed duplicate responses. Consider new strategies and avoid repeating ineffective paths already attempted.';
    this.nextStepPrompt = `${stuckPrompt}\n${this.nextStepPrompt}`;
    logger.warning(`Agent detected stuck state. Added prompt: ${stuckPrompt}`);
  }

  /**
   * Check if the agent is stuck
   */
  protected isStuck(): boolean {
    if (this.memory.messages.length < 2) {
      return false;
    }

    const lastMessage = this.memory.messages[this.memory.messages.length - 1];
    if (!lastMessage.content) {
      return false;
    }

    // Calculate the number of duplicate responses
    const duplicateCount = this.memory.messages
      .slice(0, -1)
      .reverse()
      .filter(msg => 
        msg.role === 'assistant' && msg.content === lastMessage.content
      ).length;

    return duplicateCount >= this.duplicateThreshold;
  }

  /**
   * Update the agent's memory
   */
  protected updateMemory(role: 'user' | 'system' | 'assistant', content: string): void {
    const message = role === 'user' 
      ? Message.userMessage(content)
      : role === 'system'
        ? Message.systemMessage(content)
        : Message.assistantMessage(content);
    
    this.memory.addMessage(message);
  }

  /**
   * Clean up resources used by the agent
   */
  async cleanup(): Promise<void> {
    this.memory.clear();
    this.currentStep = 0;
    this.state = AgentState.IDLE;
  }

  /**
   * Get the agent's name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get the agent's description
   */
  getDescription(): string {
    return this.description;
  }

  /**
   * Get the agent's state
   */
  getState(): AgentState {
    return this.state;
  }

  /**
   * Get the agent's messages
   */
  getMessages(): Message[] {
    return this.memory.messages;
  }
} 