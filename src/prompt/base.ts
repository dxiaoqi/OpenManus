/**
 * 基础提示词接口
 */
export interface BasePrompt {
  systemPrompt: string;
  nextStepPrompt: string;
}

/**
 * 提示词工厂类
 */
export class PromptFactory {
  private static prompts: Record<string, BasePrompt> = {};

  /**
   * 注册提示词
   */
  static register(name: string, prompt: BasePrompt): void {
    this.prompts[name] = prompt;
  }

  /**
   * 获取提示词
   */
  static get(name: string): BasePrompt {
    const prompt = this.prompts[name];
    if (!prompt) {
      throw new Error(`Prompt not found: ${name}`);
    }
    return prompt;
  }
} 