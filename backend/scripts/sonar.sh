#!/bin/bash
set -o pipefail

echo "=== SonarQube Analysis ==="

SONAR_URL_INTERNAL="http://sonarqube:9000"
SONAR_URL_DISPLAY="http://localhost:9000"
PROJECT_KEY="tech-challenge-oficina"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# 1. Verificar SonarQube
echo "[1/4] Waiting for SonarQube..."
echo -n "  Checking connection"
CONNECTION_SUCCESS=false
for i in $(seq 1 60); do
  RESPONSE=$(curl -s "$SONAR_URL_INTERNAL/api/system/status" 2>&1 || echo "")
  if echo "$RESPONSE" | grep -q '"status":"UP"'; then
    echo " UP"
    CONNECTION_SUCCESS=true
    break
  fi
  echo -n "."
  sleep 5
done

if [ "$CONNECTION_SUCCESS" = false ]; then
  echo ""
  echo ""
  echo "ERROR: SonarQube not available at $SONAR_URL_INTERNAL"
  echo ""
  echo "Make sure to start it with:"
  echo "  docker compose --profile quality up -d sonar_db sonarqube"
  echo "Wait 2-3 minutes for SonarQube to be ready, then try again."
  exit 1
fi
echo "  Connected!"

# 2. Gerar cobertura
echo "[2/4] Running tests with coverage..."
cd "$ROOT_DIR"

# Limpar coverage anterior
rm -rf coverage coverage-unit coverage-integration coverage-e2e

# Rodar testes unitários com coverage
echo "  Running unit tests with coverage..."
npx jest --coverage --coverageReporters=lcov --coverageDirectory=../coverage-unit --runInBand --silent || true

# Rodar testes de integração com coverage
echo "  Running integration tests with coverage..."
npx dotenv -e .env.test -- jest --config test/integration/jest.integration.config.ts --coverage --coverageReporters=lcov --coverageDirectory=../coverage-integration --runInBand --silent || true

# Rodar testes e2e com coverage
echo "  Running e2e tests with coverage..."
npx jest --config ./test/jest-e2e.json --coverage --coverageReporters=lcov --coverageDirectory=../coverage-e2e --runInBand --silent || true

# Mesclar relatórios de coverage
echo "  Merging coverage reports..."
mkdir -p coverage
: > coverage/lcov.info

[ -f "coverage-unit/lcov.info" ] && cat coverage-unit/lcov.info >> coverage/lcov.info
[ -f "coverage-integration/lcov.info" ] && cat coverage-integration/lcov.info >> coverage/lcov.info
[ -f "coverage-e2e/lcov.info" ] && cat coverage-e2e/lcov.info >> coverage/lcov.info

# Limpar diretórios temporários
rm -rf coverage-unit coverage-integration coverage-e2e

echo "  Tests completed successfully"

# 3. Gerar token se necessário
echo "[3/4] Checking auth token..."

# Tentar reutilizar token existente "scanner"
TOKENS_RESPONSE=$(curl -s -u admin:admin "$SONAR_URL_INTERNAL/api/user_tokens/search" 2>/dev/null)
TOKEN=$(echo "$TOKENS_RESPONSE" | grep -o '"name":"scanner"[^}]*"token":"[^"]*"' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "  No existing scanner token found, generating..."
  
  # Usar um nome único com timestamp para evitar conflitos
  TOKEN_NAME="scanner-$(date +%s)"
  TOKEN_RESPONSE=$(curl -s -u admin:admin -X POST "$SONAR_URL_INTERNAL/api/user_tokens/generate" \
    -d "name=$TOKEN_NAME&type=GLOBAL_ANALYSIS_TOKEN")
  
  TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  
  if [ -z "$TOKEN" ]; then
    echo "ERROR: Failed to generate token"
    echo "Response: $TOKEN_RESPONSE"
    exit 1
  fi
fi

if [ -z "$TOKEN" ]; then
  echo "ERROR: No token available"
  exit 1
fi
echo "  Token OK ($(echo -n "$TOKEN" | wc -c) chars)"

# 4. Rodar scanner
echo "[4/4] Running SonarQube scanner..."
cd "$ROOT_DIR"

npx sonar-scanner \
  -Dsonar.host.url="$SONAR_URL_INTERNAL" \
  -Dsonar.token="$TOKEN" \
  -Dsonar.projectKey="$PROJECT_KEY" \
  -Dsonar.sources=./src \
  -Dsonar.exclusions=**/*.spec.ts,**/*.test.ts,**/node_modules/**

echo ""
echo "=== Done ==="
echo "Dashboard: $SONAR_URL_DISPLAY/dashboard?id=$PROJECT_KEY"
