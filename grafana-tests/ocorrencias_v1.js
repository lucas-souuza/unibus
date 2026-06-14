/**
 * Teste de carga — POST /api/ocorrencias
 * Compatível com Grafana Cloud k6.
 *
 * Variáveis de ambiente:
 *   BASE_URL
 *   K6_USER_EMAIL
 *   K6_USER_PASSWORD
 *   K6_LINHA (opcional)
 *   K6_OCORRENCIA_TIPO (opcional)
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

import { buildOptions } from './lib/options.js';
import { login } from './lib/auth.js';

const BASE_URL = __ENV.BASE_URL;
const EMAIL = __ENV.K6_USER_EMAIL;
const PASSWORD = __ENV.K6_USER_PASSWORD;

const LINHA = __ENV.K6_LINHA || '636';
const TIPO = __ENV.K6_OCORRENCIA_TIPO || 'ATRASO';

export const options = buildOptions({
  service: 'ocorrencias',
  version: 'antigo'
});

/**
 * Cada VU mantém sua própria sessão.
 */
const sessions = {};

export default function () {
  if (!BASE_URL) {
    throw new Error('Defina BASE_URL.');
  }

  if (!EMAIL || !PASSWORD) {
    throw new Error(
      'Defina K6_USER_EMAIL e K6_USER_PASSWORD.'
    );
  }

  if (!sessions[__VU]) {
    sessions[__VU] = login(
      BASE_URL,
      EMAIL,
      PASSWORD
    );
  }

  const auth = sessions[__VU];

  const payload = JSON.stringify({
    numeroLinha: LINHA,
    tipo: TIPO,
    descricao: `carga-k6 vu=${__VU} iter=${__ITER}`,
  });

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (auth.csrfToken && auth.csrfHeader) {
    headers[auth.csrfHeader] = auth.csrfToken;
  }

  const res = http.post(
    `${BASE_URL}/api/ocorrencias`,
    payload,
    {
      jar: auth.jar,
      headers,
      tags: {
        name: 'POST_ocorrencias',
        endpoint: '/api/ocorrencias',
      },
    }
  );

  check(res, {
    'status é 201': (r) => r.status === 201,
    'retorna id': (r) => {
      try {
        const body = r.json();
        return body && body.id != null;
      } catch (_) {
        return r.status === 201;
      }
    },
  });

  sleep(1);
}