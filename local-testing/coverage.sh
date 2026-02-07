#!/bin/bash
# Coverage script that runs each test file individually and merges coverage reports
# This works around the clarinet-sdk limitation where coverage gets overwritten across test files

set -e

echo "=== hBTC Coverage Report Generator ==="
echo ""

# Create temp directory for individual coverage files
COVERAGE_DIR="coverage-temp"
rm -rf "$COVERAGE_DIR"
mkdir -p "$COVERAGE_DIR"

# Get all test files
TEST_FILES=$(find tests/hbtc -name "*.test.ts" -type f | sort)
TOTAL_FILES=$(echo "$TEST_FILES" | wc -l)
CURRENT=0
FAILED_TESTS=()

echo "Found $TOTAL_FILES test files"
echo ""

# Run each test file individually and collect coverage
for TEST_FILE in $TEST_FILES; do
  CURRENT=$((CURRENT + 1))
  FILENAME=$(basename "$TEST_FILE" .test.ts)
  echo "[$CURRENT/$TOTAL_FILES] Running: $FILENAME"

  # Run test with coverage, capture exit status (disable set -e for this command)
  set +e
  npm run test -- "$TEST_FILE" -- --coverage
  TEST_EXIT_CODE=$?
  set -e

  # Record failure but continue to collect coverage
  if [ $TEST_EXIT_CODE -ne 0 ]; then
    echo "  -> TEST FAILED (exit code: $TEST_EXIT_CODE)" >&2
    FAILED_TESTS+=("$TEST_FILE")
  fi

  # Move the lcov file with unique name (even if test failed, coverage may exist)
  if [ -f "lcov.info" ]; then
    mv lcov.info "$COVERAGE_DIR/lcov-$FILENAME.info"
    echo "  -> Coverage saved"
  else
    echo "  -> No coverage generated"
  fi
done

# Report failed tests
if [ ${#FAILED_TESTS[@]} -gt 0 ]; then
  echo "" >&2
  echo "=== WARNING: ${#FAILED_TESTS[@]} test(s) failed ===" >&2
  for FAILED in "${FAILED_TESTS[@]}"; do
    echo "  - $FAILED" >&2
  done
  echo "" >&2
fi

echo ""
echo "=== Merging coverage reports ==="

# Check if lcov is available
if ! command -v lcov &> /dev/null; then
  echo "ERROR: lcov is not installed." >&2
  echo "" >&2
  echo "Install lcov using your package manager:" >&2
  echo "  Ubuntu/Debian: sudo apt-get install lcov" >&2
  echo "  macOS (Homebrew): brew install lcov" >&2
  echo "  macOS (MacPorts): sudo port install lcov" >&2
  echo "  Fedora/RHEL: sudo dnf install lcov" >&2
  echo "  Arch Linux: sudo pacman -S lcov" >&2
  echo "  Windows (via chocolatey): choco install lcov" >&2
  echo "" >&2
  if [ "${ALLOW_INSTALLS:-}" = "true" ]; then
    echo "ALLOW_INSTALLS=true detected. Attempting apt-get install..." >&2
    apt-get install -y lcov || {
      echo "ERROR: Failed to install lcov. Please install manually." >&2
      exit 1
    }
  else
    echo "Set ALLOW_INSTALLS=true to attempt automatic installation (requires apt-get)." >&2
    exit 1
  fi
fi

# Build the merge command
LCOV_ARGS=""
for LCOV_FILE in "$COVERAGE_DIR"/lcov-*.info; do
  if [ -f "$LCOV_FILE" ]; then
    LCOV_ARGS="$LCOV_ARGS -a $LCOV_FILE"
  fi
done

# Merge all coverage files (with branch coverage enabled)
if [ -n "$LCOV_ARGS" ]; then
  lcov --rc lcov_branch_coverage=1 --ignore-errors empty $LCOV_ARGS -o lcov.info
  echo "Merged coverage saved to lcov.info"
else
  echo "No coverage files to merge!"
  exit 1
fi

# Generate HTML report (with branch coverage enabled)
echo ""
echo "=== Generating HTML report ==="
genhtml lcov.info -o coverage/ --legend --branch --rc lcov_branch_coverage=1

# Cleanup
rm -rf "$COVERAGE_DIR"

echo ""
echo "=== Done! ==="
echo "Open coverage/index.html to view the report"

# Exit with failure if any tests failed
if [ ${#FAILED_TESTS[@]} -gt 0 ]; then
  echo "" >&2
  echo "ERROR: ${#FAILED_TESTS[@]} test(s) failed. See above for details." >&2
  exit 1
fi
