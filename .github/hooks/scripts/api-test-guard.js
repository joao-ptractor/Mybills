import { execSync } from 'node:child_process';

function run(command, options = {}) {
  return execSync(command, {
    stdio: 'pipe',
    encoding: 'utf8',
    ...options
  });
}

function hasApiChanges() {
  try {
    const output = run('git status --porcelain apps/api');
    return output.trim().length > 0;
  } catch {
    // Se o comando falhar, rodar por prevenção
    return true;
  }
}

function runApiTests() {
  const cwd = 'apps/api';

  console.log('[api-test-guard] Running API unit tests...');
  run('npm run test', { stdio: 'inherit', cwd });

  console.log('[api-test-guard] Running API e2e tests...');
  run('npm run test:e2e', { stdio: 'inherit', cwd });
}

try {
  if (!hasApiChanges()) {
    console.log('[api-test-guard] No changes detected in apps/api. Skipping tests.');
    process.exit(0);
  }

  runApiTests();
  console.log('[api-test-guard] All checks passed.');
  process.exit(0);
} catch (error) {
  console.error('[api-test-guard] Tests failed. Fix regressions before committing.');
  process.exit(1);
}
