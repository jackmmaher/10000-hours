#!/bin/bash
# Architecture guardrail: lib/ should not import from components/
#
# Run: ./scripts/check-architecture.sh
# Add to CI or pre-commit hook to enforce

echo "Checking for architecture violations..."

# Find any lib/ files importing from components/
violations=$(grep -r "from ['\"]\.\.\/components" src/lib/ 2>/dev/null || true)

if [ -n "$violations" ]; then
  echo "❌ ARCHITECTURE VIOLATION: lib/ is importing from components/"
  echo ""
  echo "Violations found:"
  echo "$violations"
  echo ""
  echo "Fix: Move shared types to src/lib/types.ts"
  exit 1
else
  echo "✅ No architecture violations found"
  exit 0
fi
