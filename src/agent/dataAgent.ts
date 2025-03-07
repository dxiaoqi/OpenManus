import { BaseAgent, AgentConfig, AgentContext } from './base';
import { AgentState } from '../schema';
import logger  from '../utils/logger';

export interface DataFormat {
  type: string;
  schema?: Record<string, any>;
}

export interface DataAgentConfig extends AgentConfig {
  sourceFormat: DataFormat;
  targetFormat: DataFormat;
  validateInput?: boolean;
  validateOutput?: boolean;
}

export class DataAgent extends BaseAgent {
  private sourceFormat: DataFormat;
  private targetFormat: DataFormat;
  private validateInput: boolean;
  private validateOutput: boolean;

  constructor(config: DataAgentConfig, context: AgentContext = {}) {
    super(config, context);
    this.sourceFormat = config.sourceFormat;
    this.targetFormat = config.targetFormat;
    this.validateInput = config.validateInput ?? true;
    this.validateOutput = config.validateOutput ?? true;
  }

  async initialize(): Promise<void> {
    await super.initialize();
    logger.info(`Initialized DataAgent for ${this.sourceFormat.type} to ${this.targetFormat.type} conversion`);
  }

  /**
   * 执行单个步骤
   */
  protected async step(): Promise<string> {
    const messages = this.memory.messages;
    if (messages.length === 0) {
      return 'No input to process';
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage.content) {
      return 'Empty input';
    }

    try {
      // 解析输入数据
      const input = JSON.parse(lastMessage.content);

      // 验证输入数据
      if (this.validateInput && !this.validateData(input, this.sourceFormat)) {
        throw new Error('Input data does not match source format');
      }

      // 执行转换
      const result = await this.convert(input);

      // 验证输出数据
      if (this.validateOutput && !this.validateData(result, this.targetFormat)) {
        throw new Error('Converted data does not match target format');
      }

      // 添加结果到内存
      this.updateMemory('assistant', JSON.stringify(result, null, 2));

      // 完成处理
      this.state = AgentState.FINISHED;

      return `Successfully converted data from ${this.sourceFormat.type} to ${this.targetFormat.type}`;
    } catch (error) {
      logger.error(`Error in data conversion: ${error}`);
      return `Error: ${error.message}`;
    }
  }

  private validateData(data: any, format: DataFormat): boolean {
    if (format.type === 'json' && format.schema) {
      // 检查必要的字段是否存在
      for (const key in format.schema) {
        if (format.schema[key].required && !(key in data)) {
          return false;
        }
      }
    }
    return true;
  }

  private async convert(input: any): Promise<any> {
    // 根据源格式和目标格式执行转换
    if (this.sourceFormat.type === this.targetFormat.type) {
      return input;
    }

    switch (`${this.sourceFormat.type}-${this.targetFormat.type}`) {
      case 'json-xml':
        return this.jsonToXml(input);
      case 'xml-json':
        return this.xmlToJson(input);
      case 'csv-json':
        return this.csvToJson(input);
      case 'json-csv':
        return this.jsonToCsv(input);
      default:
        throw new Error(`Unsupported conversion: ${this.sourceFormat.type} to ${this.targetFormat.type}`);
    }
  }

  private jsonToXml(json: any): string {
    // 简单实现，实际应用中可能需要更复杂的转换
    const convertToXml = (obj: any, rootName: string = 'root'): string => {
      if (typeof obj !== 'object' || obj === null) {
        return `<${rootName}>${obj}</${rootName}>`;
      }

      if (Array.isArray(obj)) {
        return obj.map(item => convertToXml(item, 'item')).join('');
      }

      let xml = `<${rootName}>`;
      for (const key in obj) {
        xml += convertToXml(obj[key], key);
      }
      xml += `</${rootName}>`;
      return xml;
    };

    return `<?xml version="1.0" encoding="UTF-8"?>${convertToXml(json)}`;
  }

  private xmlToJson(xml: string): any {
    // 简化实现，实际应用中应使用XML解析库
    return { message: "XML parsing not fully implemented", originalXml: xml };
  }

  private csvToJson(csv: string): any[] {
    const lines = csv.split('\n');
    const headers = lines[0].split(',');
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const obj: Record<string, string> = {};
      const currentLine = lines[i].split(',');

      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentLine[j];
      }

      result.push(obj);
    }

    return result;
  }

  private jsonToCsv(json: any[]): string {
    if (!Array.isArray(json) || json.length === 0) {
      return '';
    }

    const headers = Object.keys(json[0]);
    const csvRows = [];

    // 添加标题行
    csvRows.push(headers.join(','));

    // 添加数据行
    for (const row of json) {
      const values = headers.map(header => {
        const val = row[header];
        return `"${val}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }
} 