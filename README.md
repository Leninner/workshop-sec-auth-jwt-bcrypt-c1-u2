# Autenticación Segura con JWT y bcrypt

> **Tipo:** CODE_QUALITY · **Duración estimada:** 300 min · **Nivel:** Avanzado · **Prerequisito:** Crypto Fundamentals

## Objetivo

Implementar un flujo de autenticación completo con bcrypt (cost ≥ 10), JWT de duración ≤ 15 min, refresh tokens rotativos, rate limiting en login, y bloqueo tras 5 intentos fallidos.

## Contexto

La autenticación rota es la segunda vulnerabilidad más común según OWASP (A07:2021). Los errores típicos: passwords en texto plano, JWTs que nunca expiran, ausencia de rate limiting. Este taller implementa los controles de la industria.

El starter provee la app Express con los endpoints vacíos y la BD SQLite configurada. Tú implementas la lógica de autenticación y los tests de seguridad.

## Estructura del proyecto

```
src/
├── main.ts                      # App Express — PROVISTO, no modificar
├── database.ts                  # SQLite schema — PROVISTO, no modificar
├── auth/
│   ├── auth.controller.ts       # Endpoints — IMPLEMENTAR
│   ├── auth.service.ts          # Lógica de auth — IMPLEMENTAR
│   └── auth.middleware.ts       # Rate limiting + JWT verify — IMPLEMENTAR
└── users/
    └── users.repository.ts      # Consultas a BD — IMPLEMENTAR
tests/
└── auth/
    └── auth.integration.test.ts # Tests de seguridad — ESCRIBIR
```

## Instrucciones

### 1. Prepara tu entorno

```bash
git clone <url-de-tu-repositorio>
cd workshop-sec-auth-jwt-bcrypt
npm install
cp .env.example .env
```

### 2. Configura variables de entorno

Edita `.env` con valores seguros (nunca los suba al repositorio):

```bash
# Genera secretos aleatorios:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Implementa los endpoints

**`POST /auth/register`**
- Recibe `{ email, password }`
- Hashea password con bcrypt (cost ≥ 10)
- Retorna `{ userId, email, createdAt }` | Error 409 si email ya existe

**`POST /auth/login`**
- Verifica password con bcrypt
- Genera access token (JWT, exp ≤ 15 min) + refresh token opaco (7 días)
- Rate limiting: máx. 5 req/min por IP → Error 429 con cabecera `Retry-After`
- Bloqueo tras 5 intentos fallidos consecutivos por 30 min → Error 423

**`POST /auth/refresh`**
- Invalida el refresh token anterior, emite nuevos access + refresh tokens

**`POST /auth/logout`**
- Invalida el refresh token actual

### 4. Escribe los tests de integración

En `tests/auth/auth.integration.test.ts` cubre al menos:

- Registro exitoso y duplicado (409)
- Login exitoso (verifica estructura `{ accessToken, refreshToken, expiresIn }`)
- Login con credenciales incorrectas (401)
- Rate limiting: la 6ta petición en < 1 min debe devolver 429
- Bloqueo: tras 5 intentos fallidos consecutivos, el 6to devuelve 423
- Rotación de refresh token: el token anterior queda invalidado

```bash
npm test
```

### 5. Abre el Pull Request

1. `git push origin feat/auth-jwt-bcrypt`
2. Abre PR hacia `main`
3. Verifica que los Checks pasen

## Criterios de evaluación

| Métrica | Peso | Umbral |
|---|---|---|
| Fortaleza del hashing | 20% | bcrypt detectado con cost ≥ 10 |
| Mecanismo de auth | 15% | JWT con firma y expiración configurados |
| Expiración JWT | 15% | Access token expira en ≤ 15 minutos |
| Rate limiting | 15% | Middleware en `/auth/login` |
| Tests pasando | 20% | 100% de los tests de integración |
| Secretos detectados | 8% | 0 secretos hardcodeados en el código |
| Hallazgos SAST | 7% | 0 hallazgos de severidad alta |

## Variables de entorno requeridas

| Variable | Descripción |
|---|---|
| `JWT_SECRET` | Secreto para firmar access tokens (mín. 32 chars) |
| `JWT_REFRESH_SECRET` | Secreto para refresh tokens (distinto del anterior) |
| `DATABASE_URL` | Ruta al archivo SQLite (`:memory:` para tests) |

## Recursos

- [OWASP A07:2021 — Identification and Authentication Failures](https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/)
- [JWT Best Practices (RFC 8725)](https://datatracker.ietf.org/doc/html/rfc8725)
- [bcrypt — Why cost ≥ 10?](https://security.stackexchange.com/questions/17207/recommended-of-rounds-for-bcrypt)
- [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit)
- [Refresh Token Rotation](https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation)
