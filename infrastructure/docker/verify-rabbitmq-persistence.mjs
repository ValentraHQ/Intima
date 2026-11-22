// Regression check for local RabbitMQ persistence (pnpm stack:verify-rabbitmq).
// Declares a durable queue, publishes one persistent synthetic marker message, restarts
// the stack with `docker compose down` (volumes kept) and `up --wait`, and checks that
// the queue and the message survived. Cleans up its queue afterwards.
// Local stack only: talks to the management API on 127.0.0.1:15672.
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const envFile = join(here, '.env');
const composeArgs = ['compose', '-f', join(here, 'compose.yaml'), '--env-file', envFile];

const env = Object.fromEntries(
  readFileSync(envFile, 'utf8')
    .split(/\r?\n/)
    .filter((line) => /^[A-Z0-9_]+=/.test(line))
    .map((line) => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1)]),
);
const auth = 'Basic ' + Buffer.from(`intima:${env.RABBITMQ_PASSWORD}`).toString('base64');
const base = 'http://127.0.0.1:15672/api';
const queue = 'intima.persistence-check';
const queueUrl = `${base}/queues/%2F/${queue}`;
const marker = `synthetic-marker-${randomBytes(6).toString('hex')}`;

async function api(method, url, body, attempts = 30) {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url, {
        method,
        headers: { authorization: auth, 'content-type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`${method} ${url}: HTTP ${res.status} ${await res.text()}`);
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    } catch (err) {
      if (i >= attempts) throw err;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

function compose(...args) {
  const result = spawnSync('docker', [...composeArgs, ...args], { stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`docker compose ${args.join(' ')} failed`);
}

let failed = false;
try {
  await api('PUT', queueUrl, { durable: true, auto_delete: false });
  const published = await api('POST', `${base}/exchanges/%2F/amq.default/publish`, {
    routing_key: queue,
    payload: marker,
    payload_encoding: 'string',
    properties: { delivery_mode: 2 },
  });
  if (!published.routed) throw new Error('marker message was not routed to the queue');
  const nodeBefore = (await api('GET', queueUrl)).node;
  console.log(`Published persistent marker to ${queue} on ${nodeBefore}`);

  console.log('Restarting the stack (down without -v, then up --wait)...');
  compose('down');
  compose('up', '-d', '--wait', '--wait-timeout', '180');

  const after = await api('GET', queueUrl);
  const got = await api('POST', `${queueUrl}/get`, {
    count: 1,
    ackmode: 'ack_requeue_false',
    encoding: 'auto',
  });
  const payload = got[0]?.payload;
  console.log(`After restart: node ${after.node}, durable ${after.durable}, payload ${payload}`);
  if (after.node !== nodeBefore) throw new Error(`node changed: ${nodeBefore} -> ${after.node}`);
  if (payload !== marker) throw new Error('marker message did not survive the restart');
  console.log('PASS: durable queue and persistent message survived stack:down / stack:up');
} catch (err) {
  failed = true;
  console.error(`FAIL: ${err instanceof Error ? err.message : String(err)}`);
} finally {
  await api('DELETE', queueUrl, undefined, 3).catch(() => {});
}
process.exit(failed ? 1 : 0);
