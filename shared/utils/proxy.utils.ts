import axios from 'axios';
import { HttpProxyAgent } from 'http-proxy-agent';
import chalk from 'chalk';
import pLimit from 'p-limit';
import path from 'path';
import * as fs from 'fs';
import dayjs from 'dayjs';

const CACHE_FILE = path.resolve(__dirname, 'proxy-cache.json');

const limit = pLimit(20);

// Đọc cache nếu tồn tại và còn trong ngày
function readProxyCache(): string[] | null {
  if (!fs.existsSync(CACHE_FILE)) return null;

  try {
    const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
    const data = JSON.parse(raw);

    if (data.date === dayjs().format('YYYY-MM-DD') && Array.isArray(data.proxies)) {
      console.log(chalk.blue('📦 Đọc proxy từ cache...'));
      return data.proxies;
    }
  } catch (err) {
    console.log(chalk.red('⚠️ Không đọc được proxy cache:', err));
  }

  return null;
}

// Ghi proxy còn sống vào cache
function writeProxyCache(proxies: string[]) {
  try {
    const data = {
      date: dayjs().format('YYYY-MM-DD'),
      proxies,
    };
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
    console.log(chalk.yellow('💾 Đã lưu cache proxy.'));
  } catch (err) {
    console.log(chalk.red('⚠️ Không ghi được proxy cache:', err));
  }
}

const testProxy = async (proxy: string): Promise<boolean> => {
  try {
    const agent = new HttpProxyAgent(proxy);
    const response = await axios.get('https://httpbin.org/ip', {
      httpAgent: agent,
      httpsAgent: agent,
      timeout: 1000,
    });

    console.log(chalk.green(`[✔️ Proxy sống]: ${proxy}`));
    return response.status === 200;
  } catch {
    console.log(chalk.red(`[❌ Proxy chết]: ${proxy}`));
    return false;
  }
};

export async function getProxy(
  config = {
    request: 'get_proxies',
    protocol: 'http',
    proxy_format: 'protocolipport',
    format: 'text',
    anonymity: 'Elite',
    timeout: 500,
  },
): Promise<string[]> {
  const cached = readProxyCache();
  if (cached) {
    console.log(chalk.green(`✅ Đang dùng lại ${cached.length} proxy từ cache.`));
    return cached;
  }

  const url = `https://api.proxyscrape.com/v4/free-proxy-list/get`;
  const response = await axios.get(url, { params: config });

  if (response.status !== 200) {
    console.log(chalk.red('Lỗi khi lấy danh sách proxy'));
    return [];
  }

  let rawProxies = response.data
    .split('\n')
    .map((p: string) => p.trim())
    .filter(Boolean)
    .sort(() => Math.random() - 0.5);

  console.log('Tổng proxy lấy được:', rawProxies.length);

  const results = await Promise.all(
    rawProxies.map((proxy: string) =>
      limit(async () => {
        const isAlive = await testProxy(proxy);
        return isAlive ? proxy : null;
      }),
    ),
  );

  const aliveProxies = results.filter(Boolean) as string[];
  console.log('Tổng proxy còn sống:', aliveProxies.length);

  writeProxyCache(aliveProxies);

  return aliveProxies;
}
