import http from 'k6/http';
import { check } from 'k6';

/**
 * Extrai token e nome do parâmetro CSRF do HTML (login ou index).
 */
export function parseCsrf(html) {
  const paramMatch = html.match(/name="_csrf"\s+content="([^"]+)"/);
  const headerMatch = html.match(/name="_csrf_header"\s+content="([^"]+)"/);
  const tokenMatch = html.match(/name="_csrf"\s+value="([^"]+)"/);

  const token = paramMatch ? paramMatch[1] : tokenMatch ? tokenMatch[1] : null;
  const header = headerMatch ? headerMatch[1] : 'X-CSRF-TOKEN';

  return { token, header, param: '_csrf' };
}

/**
 * Login form-based (Spring Security) + CSRF da página inicial para APIs.
 * Retorna { jar, csrfToken, csrfHeader } ou lança via check.
 */
export function login(baseUrl, email, password) {
  const jar = http.cookieJar();

  const loginPage = http.get(`${baseUrl}/login`, { jar });
  check(loginPage, { 'login page 200': (r) => r.status === 200 });

  const csrfLogin = parseCsrf(loginPage.body);
  const loginRes = http.post(
    `${baseUrl}/login`,
    {
      username: email,
      password: password,
      [csrfLogin.param]: csrfLogin.token,
    },
    {
      jar,
      redirects: 0,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
  );

  const okLogin =
    loginRes.status === 302 ||
    loginRes.status === 200 ||
    loginRes.status === 303;
  check(loginRes, { 'login aceito': () => okLogin });

  const home = http.get(`${baseUrl}/`, { jar });
  check(home, { 'home 200': (r) => r.status === 200 });

  const csrfApi = parseCsrf(home.body);
  return {
    jar,
    csrfToken: csrfApi.token,
    csrfHeader: csrfApi.header,
  };
}
