// Removes the files that init-env.sh generates under infrastructure/docker/.generated.
// Cross-platform replacement for `rm -rf` (pnpm runs scripts through cmd.exe on Windows).
// Deletes exactly one fixed directory next to this script and nothing else; .env is kept.
import { existsSync, lstatSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const target = join(here, '.generated');

if (!existsSync(target)) {
  console.log('Nothing to clean: infrastructure/docker/.generated does not exist');
} else {
  const stat = lstatSync(target);
  if (stat.isSymbolicLink()) {
    // Never follow a link out of the repository; remove the link itself only.
    rmSync(target);
  } else {
    rmSync(target, { recursive: true, force: true });
  }
  console.log('Removed infrastructure/docker/.generated');
}
