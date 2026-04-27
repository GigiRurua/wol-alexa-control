import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export default async function handler(req, res) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const providedPassword = req.headers['x-admin-password'];

  if (!adminPassword || providedPassword !== adminPassword) {
    return res.status(401).json({ error: 'Unauthorized: Incorrect password or not configured on Vercel' });
  }

  if (req.method === 'POST') {
    const { mac, name } = req.body;
    if (!mac || !name) return res.status(400).json({ error: 'Missing data' });
    let devices = await redis.get('wol_devices') || [];

    const index = devices.findIndex(d => d.mac === mac);
    if (index > -1) devices[index] = { mac, name };
    else devices.push({ mac, name });

    await redis.set('wol_devices', devices);
    return res.status(200).json({ success: true, devices });
  }

  if (req.method === 'DELETE') {
    const { mac } = req.body;
    let devices = await redis.get('wol_devices') || [];
    devices = devices.filter(d => d.mac !== mac);
    await redis.set('wol_devices', devices);
    return res.status(200).json({ success: true, devices });
  }

  if (req.method === 'GET') {
    let devices = await redis.get('wol_devices');

    if (!devices || devices.length === 0) {
      const oldConfig = await redis.get('wol_config');
      if (oldConfig && oldConfig.mac) {
        devices = [oldConfig];
        await redis.set('wol_devices', devices);
      } else {
        devices = [];
      }
    }

    return res.status(200).json(devices);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
