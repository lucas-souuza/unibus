/**
 * Teste de carga — GET /api/onibus/posicoes (leitura, integração SPPO + GTFS em memória).
 *
 * Variáveis de ambiente:
 *   BASE_URL (default http://localhost:8080)
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.4/index.js';
import { buildOptions } from './lib/options.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

export const options = buildOptions({ service: 'posicoes' });

export default function () {
  const res = http.get(`${BASE_URL}/api/onibus/posicoes`, {
    headers: { Accept: 'application/json' },
    tags: { name: 'GET_posicoes' },
  });

  check(res, {
    'status 200': (r) => r.status === 200,
    'json array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body);
      } catch {
        return false;
      }
    },
  });

  sleep(0.5);
}

export function handleSummary(data) {
  return {
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
    [`results/summary-posicoes-${timestamp()}.json`]: JSON.stringify(data, null, 2),
  };
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}
