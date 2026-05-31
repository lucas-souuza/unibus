/**
 * Teste de carga — POST /api/ocorrencias (inserção no MySQL).
 *
 * Variáveis de ambiente:
 *   BASE_URL, K6_USER_EMAIL, K6_USER_PASSWORD, K6_LINHA, K6_OCORRENCIA_TIPO
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.4/index.js';
import { buildOptions } from './lib/options.js';
import { login } from './lib/auth.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const EMAIL = __ENV.K6_USER_EMAIL;
const PASSWORD = __ENV.K6_USER_PASSWORD;
const LINHA = __ENV.K6_LINHA || '636';
const TIPO = __ENV.K6_OCORRENCIA_TIPO || 'ATRASO';

export const options = buildOptions({ service: 'ocorrencias' });

/** Sessão por VU (cada usuário virtual autentica uma vez). */
let auth;

export default function () {
  if (!EMAIL || !PASSWORD) {
    throw new Error('Defina K6_USER_EMAIL e K6_USER_PASSWORD (arquivo .env ou -e).');
  }
  if (!auth) {
    auth = login(BASE_URL, EMAIL, PASSWORD);
  }
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

  const res = http.post(`${BASE_URL}/api/ocorrencias`, payload, {
    jar: auth.jar,
    headers,
    tags: { name: 'POST_ocorrencias' },
  });

  check(res, {
    'status 201': (r) => r.status === 201,
    'corpo com id': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body && body.id != null;
      } catch {
        return r.status === 201;
      }
    },
  });

  sleep(1);
}

export function handleSummary(data) {
  return {
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
    [`results/summary-ocorrencias-${timestamp()}.json`]: JSON.stringify(data, null, 2),
  };
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}
