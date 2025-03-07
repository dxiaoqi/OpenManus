import * as fs from 'fs';
import * as path from 'path';

/**
 * LLM 设置接口
 */
export interface LLMSettings {
  model: string;
  baseUrl: string;
  apiKey: string;
  maxTokens: number;
  temperature: number;
}

/**
 * 应用配置接口
 */
export interface AppConfig {
  llm: Record<string, LLMSettings>;
}

/**
 * 获取项目根目录
 */
export function getProjectRoot(): string {
  return path.resolve(__dirname, '..');
}

export const PROJECT_ROOT = getProjectRoot();
export const WORKSPACE_ROOT = path.join(PROJECT_ROOT, 'workspace');

/**
 * 配置类，单例模式
 */
export class Config {
  private static instance: Config;
  private initialized: boolean = false;
  private config: AppConfig | null = null;

  private constructor() {
    this.loadInitialConfig();
  }

  /**
   * 获取配置实例
   */
  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  /**
   * 获取配置文件路径
   */
  private getConfigPath(): string {
    const root = PROJECT_ROOT;
    const configPath = path.join(root, 'config', 'config.json');
    
    if (fs.existsSync(configPath)) {
      return configPath;
    }
    
    const examplePath = path.join(root, 'config', 'config.example.json');
    if (fs.existsSync(examplePath)) {
      return examplePath;
    }
    
    throw new Error('No configuration file found in config directory');
  }

  /**
   * 加载配置文件
   */
  private loadConfig(): any {
    const configPath = this.getConfigPath();
    const configContent = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(configContent);
  }

  /**
   * 加载初始配置
   */
  private loadInitialConfig(): void {
    if (this.initialized) return;

    try {
      const rawConfig = this.loadConfig();
      const baseLlm = rawConfig.llm || {};
      
      const llmOverrides: Record<string, any> = {};
      for (const [key, value] of Object.entries(baseLlm)) {
        if (typeof value === 'object' && value !== null) {
          llmOverrides[key] = value;
        }
      }

      const defaultSettings = {
        model: baseLlm.model,
        baseUrl: baseLlm.baseUrl,
        apiKey: baseLlm.apiKey,
        maxTokens: baseLlm.maxTokens || 4096,
        temperature: baseLlm.temperature || 1.0
      };

      const configDict: AppConfig = {
        llm: {
          default: defaultSettings as LLMSettings,
          ...Object.fromEntries(
            Object.entries(llmOverrides).map(([name, overrideConfig]) => [
              name,
              { ...defaultSettings, ...overrideConfig }
            ])
          )
        }
      };

      this.config = configDict;
      this.initialized = true;
    } catch (error) {
      console.error('Failed to load configuration:', error);
      throw error;
    }
  }

  /**
   * 获取 LLM 配置
   */
  get llm(): Record<string, LLMSettings> {
    if (!this.config) {
      throw new Error('Configuration not initialized');
    }
    return this.config.llm;
  }
}

// 导出配置实例
export const config = Config.getInstance(); 