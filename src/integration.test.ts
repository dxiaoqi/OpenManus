import { AgentFactory, AgentType } from './agent/agentFactory';
import { delay } from './utils';

describe('Agent Integration Tests', () => {
  test('TextAgent should process text correctly', async () => {
    const agent = AgentFactory.createAgent(
      AgentType.TEXT,
      {
        name: 'TestTextAgent',
        description: 'Agent for testing text processing',
        maxLength: 10,
        language: 'en'
      }
    );

    await agent.initialize();
    
    const result = await agent.run('This is a long text that should be truncated');
    expect(result).toBe('This is a ...');
    
    await agent.cleanup();
  });

  test('DataAgent should convert JSON to CSV', async () => {
    const agent = AgentFactory.createAgent(
      AgentType.DATA,
      {
        name: 'TestDataAgent',
        description: 'Agent for testing data conversion',
        sourceFormat: { type: 'json' },
        targetFormat: { type: 'csv' }
      }
    );

    await agent.initialize();
    
    const jsonData = [
      { name: 'John', age: 30, city: 'New York' },
      { name: 'Alice', age: 25, city: 'Boston' }
    ];
    
    const result = await agent.run(jsonData);
    expect(result).toContain('name,age,city');
    expect(result).toContain('"John","30","New York"');
    expect(result).toContain('"Alice","25","Boston"');
    
    await agent.cleanup();
  });

  test('Agents should work together in sequence', async () => {
    // 创建文本代理
    const textAgent = AgentFactory.createAgent(
      AgentType.TEXT,
      {
        name: 'SequenceTextAgent',
        maxLength: 50
      }
    );

    // 创建数据代理
    const dataAgent = AgentFactory.createAgent(
      AgentType.DATA,
      {
        name: 'SequenceDataAgent',
        sourceFormat: { type: 'json' },
        targetFormat: { type: 'xml' }
      }
    );

    // 初始化代理
    await textAgent.initialize();
    await dataAgent.initialize();

    // 模拟处理流程
    const text = 'This is a very long text that contains information about users: John is 30 years old and Alice is 25 years old.';
    const processedText = await textAgent.run(text);
    
    // 从文本中提取信息并创建JSON
    const extractedData = {
      users: [
        { name: 'John', age: 30 },
        { name: 'Alice', age: 25 }
      ]
    };

    // 将JSON转换为XML
    const xmlResult = await dataAgent.run(extractedData);
    
    // 验证结果
    expect(processedText.length).toBeLessThanOrEqual(53); // 50 + '...'
    expect(xmlResult).toContain('<users>');
    expect(xmlResult).toContain('<name>John</name>');
    expect(xmlResult).toContain('<age>30</age>');
    
    // 清理资源
    await textAgent.cleanup();
    await dataAgent.cleanup();
  });
}); 