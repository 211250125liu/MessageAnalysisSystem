import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const backendUrl = `http://172.29.7.168:65348${req.url?.replace('/api', '') || ''}`;

    const headers = new Headers({
        'Host': '172.29.7.168:65348',
        'Accept': '*/*', // 根据需要添加其他头部
        // 这里可以继续添加其他头部
    });

    try {
        const response = await fetch(backendUrl, {
            method: req.method,
            headers: headers, // 使用 Headers 实例
            body: req.method !== 'GET' ? JSON.stringify(req.body) : null,
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error : any) {
        res.status(500).json({ error: 'Backend request failed', details: error.message });
    }
}
