#!/bin/bash
set -o pipefail

echo "=== SonarQube Analysis (tests in container, scanner via sidecar) ==="

PROJECT_KEY="tech-challenge-oficina"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Detectar se está dentro do container
if [ -f /.dockerenv ] || getent hosts sonarqube >/dev/null 2>&1; then
  IN_CONTAINER=true
  SONAR_URL="http://sonarqube:9000"
  APP_DIR="$BACKEND_DIR"
else
  IN_CONTAINER=false
  SONAR_URL="http://localhost:9000"
  APP_DIR="$BACKEND_DIR"
fi

# 1. Verificar SonarQube
echo "[1/3] Waiting for SonarQube at $SONAR_URL..."
echo -n "  Checking connection"
CONNECTION_SUCCESS=false
for i in $(seq 1 60); do
  RESPONSE=$(curl -s "$SONAR_URL/api/system/status" 2>&1 || echo "")
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
  echo "ERROR: SonarQube not available at $SONAR_URL"
  exit 1
fi
echo "  Connected!"

# 2. Gerar cobertura e mesclar
echo "[2/3] Running tests with coverage..."

cd "$APP_DIR"

# Limpar coverage anterior
rm -f coverage/lcov.info combined-coverage/lcov.info
rm -rf coverage-integration coverage-unit 2>/dev/null
mkdir -p coverage-integration

# Rodar testes unitários com coverage
# --coverageDirectory=../coverage-unit é resolvido relativo ao rootDir (src/), ou seja, cria coverage-unit/ na raiz
echo "  Running unit tests with coverage..."
npx jest --coverage --coverageReporters=lcov --coverageDirectory=../coverage-unit --runInBand --silent || echo "  [WARN] Unit tests had failures, continuing..."

# Rodar testes de integração com coverage
echo "  Running integration tests with coverage..."
DATABASE_URL=postgresql://admin:adminpassword@db:5432/oficinadb_test npx jest --config test/integration/jest.integration.config.ts --coverage --coverageReporters=lcov --coverageDirectory=coverage-integration --runInBand --silent || echo "  [WARN] Integration tests had failures, continuing..."

# Mesclar relatórios de coverage (deduplicação por arquivo, mantendo unit)
echo "  Merging coverage reports..."

UNIT_LCOV=""
if [ -f coverage-unit/lcov.info ]; then
  UNIT_LCOV="coverage-unit/lcov.info"
  echo "  Unit lcov found at coverage-unit/lcov.info"
elif [ -f ../coverage-unit/lcov.info ]; then
  UNIT_LCOV="../coverage-unit/lcov.info"
  echo "  Unit lcov found at ../coverage-unit/lcov.info"
else
  echo "  [WARN] Unit coverage lcov.info not found!"
fi

# Concatenar: integration primeiro, unit depois
: > /tmp/combined_raw.info
if [ -f coverage-integration/lcov.info ]; then
  sed 's|^SF:src/|SF:backend/src/|' coverage-integration/lcov.info >> /tmp/combined_raw.info
fi
if [ -n "$UNIT_LCOV" ]; then
  sed 's|^SF:src/|SF:backend/src/|' "$UNIT_LCOV" >> /tmp/combined_raw.info
fi

# Deduplicar: para cada SF:, manter o bloco com MAIS linhas cobertas (LH)
awk '
/^SF:/ {
  cur_file = $0
  cur_block = $0 "\n"
  cur_lh = -1
  next
}
/^LH:/ {
  val = $0; sub(/^LH:/, "", val); val += 0
  cur_lh = val
  cur_block = cur_block $0 "\n"
  next
}
/^end_of_record/ {
  cur_block = cur_block $0 "\n"
  if (cur_file != "") {
    if (!(cur_file in best_lh) || cur_lh > best_lh[cur_file]) {
      best_lh[cur_file] = cur_lh
      best_block[cur_file] = cur_block
    }
  }
  cur_file = ""
  cur_block = ""
  cur_lh = -1
  next
}
cur_file != "" { cur_block = cur_block $0 "\n" }
END {
  for (f in best_block) printf "%s", best_block[f]
}
' /tmp/combined_raw.info > combined-coverage/lcov.info

UNIT_ENTRIES=$(grep -c "^SF:" "$UNIT_LCOV" 2>/dev/null || echo 0)
INT_ENTRIES=$(grep -c "^SF:" coverage-integration/lcov.info 2>/dev/null || echo 0)
DEDUP_ENTRIES=$(grep -c "^SF:" combined-coverage/lcov.info)
MERGED_LINES=$(wc -l < combined-coverage/lcov.info)
echo "  Unit: $UNIT_ENTRIES files | Integration: $INT_ENTRIES files | Merged (dedup): $DEDUP_ENTRIES files ($MERGED_LINES lines)"

# Limpar
rm -rf coverage-integration coverage-unit /tmp/combined_raw.info

echo "  Coverage ready at combined-coverage/lcov.info"

# 3. Rodar scanner
echo "[3/3] Running SonarQube scanner..."

if [ "$IN_CONTAINER" = true ]; then
  echo "  Inside container — no JRE available."
  echo "  Coverage is at: $APP_DIR/combined-coverage/lcov.info"
  echo ""
  echo "  Run the scanner from the HOST:"
  echo "    sonar-scanner -Dsonar.host.url=http://localhost:9000 -Dsonar.token=\$SONAR_TOKEN"
else
  echo "  On host — running scanner..."
  cd "$(cd "$BACKEND_DIR/.." && pwd)"
  sonar-scanner -Dsonar.host.url=http://localhost:9000 -Dsonar.token=squ_ece4455f374071d59b177a199450d69840e945a8
fi

echo ""
echo "=== Done ==="
echo "Dashboard: $SONAR_URL/dashboard?id=$PROJECT_KEY"
