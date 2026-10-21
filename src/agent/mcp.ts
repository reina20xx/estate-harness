import type { Bindings } from '../index';

export async function handleMcpRequest(req: any, env: Bindings) {
  const { id, method, params } = req;
  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: { protocolVersion: '2024-11-05', serverInfo: { name: 'estate-harness-mcp', version: '1.0.0' }, capabilities: { tools: {} } },
    };
  }
  if (method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        tools: [
          {
            name: 'list_matched_properties',
            description: '新着物件一覧と自動マッチングされた見込み客数・LINE追客メッセージを取得します',
            inputSchema: { type: 'object', properties: {} },
          },
        ],
      },
    };
  }
  if (method === 'tools/call') {
    if (params?.name === 'list_matched_properties') {
      const res = await env.DB.prepare('SELECT * FROM listings ORDER BY created_at DESC').all();
      return { jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: JSON.stringify(res.results || [], null, 2) }] } };
    }
  }
  return { jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found' } };
}
