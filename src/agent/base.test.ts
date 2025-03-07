import { BaseAgent, AgentConfig } from './base';

// 创建一个测试用的具体代理类
class TestAgent extends BaseAgent {
  async run(input: any): Promise<any> {
    return `Processed: ${input}`;
  }
}

describe('BaseAgent', () => {
  let agent: TestAgent;
  const config: AgentConfig = {
    name: 'TestAgent',
    description: 'Agent for testing'
  };

  beforeEach(() => {
    agent = new TestAgent(config);
  });

  test('should initialize with correct name and description', () => {
    expect(agent.getName()).toBe('TestAgent');
    expect(agent.getDescription()).toBe('Agent for testing');
  });

  test('should return a copy of config', () => {
    const returnedConfig = agent.getConfig();
    expect(returnedConfig).toEqual(config);
    
    // 确保返回的是副本而不是引用
    returnedConfig.name = 'Modified';
    expect(agent.getName()).toBe('TestAgent');
  });

  test('should update context correctly', () => {
    agent.updateContext({ key1: 'value1' });
    expect(agent.getContext()).toEqual({ key1: 'value1' });
    
    agent.updateContext({ key2: 'value2' });
    expect(agent.getContext()).toEqual({ key1: 'value1', key2: 'value2' });
    
    // 覆盖现有值
    agent.updateContext({ key1: 'new value' });
    expect(agent.getContext()).toEqual({ key1: 'new value', key2: 'value2' });
  });

  test('run method should process input correctly', async () => {
    const result = await agent.run('test input');
    expect(result).toBe('Processed: test input');
  });
}); 