/**
 * Teste de carga — GET /api/onibus/posicoes
 *
 * Objetivo:
 * Medir o desempenho do endpoint responsável pela consulta das posições
 * dos ônibus (integração SPPO + GTFS em memória).
 *
 * Variáveis de ambiente:
 *   BASE_URL
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { buildOptions } from './lib/options.js';

const BASE_URL = __ENV.BASE_URL;

export const options = buildOptions({
  service: 'posicoes',
  version: 'antigo'
});

export default function () {
  if (!BASE_URL) {
    throw new Error('Defina BASE_URL.');
  }

  const res = http.get(`${BASE_URL}/api/onibus/posicoes`, {
    headers: {
      Accept: 'application/json',
    },
    tags: {
      name: 'GET_posicoes',
      endpoint: '/api/onibus/posicoes',
    },
  });

  check(res, {
    'status 200': (r) => r.status === 200,

    'resposta é array': (r) => {
      try {
        return Array.isArray(r.json());
      } catch (_) {
        return false;
      }
    },
  });

  sleep(0.5);
}