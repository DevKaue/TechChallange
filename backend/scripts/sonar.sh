#!/bin/bash
set -e

echo "=== SonarQube Analysis ==="

SONAR_URL="http://localhost:9000"
PROJECT_KEY="tech-challenge-oficina"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# 1. Verificar/Iniciar SonarQube
echo "[1/4] Checking SonarQube..."
if ! curl -s "$SONAR_URL/api/system/status" | grep -q '"status":"UP"'; then
  echo "  Starting SonarQube..."
  cd "$ROOT_DIR"
  docker compose --profile quality up -d sonar_db sonarqube 2>/dev/null
  echo -n "  Waiting for SonarQube"
  for i in $(seq 1 60); do
    if curl -s "$SONAR_URL/api/system/status" | grep -q '"status":"UP"'; then
      echo " UP"
      break
    fi
    echo -n "."
    sleep 5
  done
  if ! curl -s "$SONAR_URL/api/system/status" | grep -q '"status":"UP"'; then
    echo " FAILED to start"
    exit 1
  fi
else
  echo "  Already running"
fi

# 2. Gerar cobertura
echo "[2/4] Running tests with coverage..."
cd "$ROOT_DIR/backend"
npx jest --coverage --coverageReporters=lcov --runInBand --silent

# 3. Gerar token se necessário
echo "[3/4] Checking auth token..."
TOKEN=$(curl -s -u admin:admin "$SONAR_URL/api/user_tokens/search" 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for t in data.get('userTokens', []):
        if t.get('name') == 'scanner':
            print(t['token'])
            break
except: pass
" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "  Generating token..."
  TOKEN=$(curl -s -u admin:admin -X POST "$SONAR_URL/api/user_tokens/generate" \
    -d "name=scanner&type=GLOBAL_ANALYSIS_TOKEN" | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")
fi

# 4. Rodar scanner
echo "[4/4] Running SonarQube scanner..."
cd "$ROOT_DIR"
npx sonar-scanner \
  -Dsonar.host.url="$SONAR_URL" \
  -Dsonar.token="$TOKEN" \
  -Dsonar.projectKey="$PROJECT_KEY"

echo ""
echo "=== Done ==="
echo "Dashboard: $SONAR_URL/dashboard?id=$PROJECT_KEY"
