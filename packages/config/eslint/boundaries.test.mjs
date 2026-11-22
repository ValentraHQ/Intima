import { test } from 'node:test';
import { RuleTester } from 'eslint';
import { moduleBoundariesRule } from './boundaries.mjs';

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2023, sourceType: 'module' },
});

const API = '/repo/apps/api/src/modules';

test('module-boundaries', () => {
  ruleTester.run('module-boundaries', moduleBoundariesRule, {
    valid: [
      { code: "import { x } from './service';", filename: `${API}/billing/checkout.ts` },
      { code: "import { y } from '../ledger';", filename: `${API}/billing/checkout.ts` },
      { code: "import { y } from '../ledger/index';", filename: `${API}/billing/checkout.ts` },
      { code: "import { y } from '../ledger/index.js';", filename: `${API}/billing/checkout.ts` },
      { code: "import { y } from '../../ledger';", filename: `${API}/billing/internal/repo.ts` },
      { code: "import { z } from '@intima/contracts';", filename: `${API}/billing/checkout.ts` },
      { code: "import { z } from '../../shared/util';", filename: `${API}/billing/checkout.ts` },
      { code: "import { z } from './lib';", filename: '/repo/apps/web/src/page.ts' },
      { code: "import { z } from '../src/x';", filename: '/repo/packages/ui/test/a.ts' },
    ],
    invalid: [
      {
        code: "import { LedgerRepo } from '../ledger/internal/ledger.repository';",
        filename: `${API}/billing/checkout.ts`,
        errors: [{ messageId: 'moduleInternal' }],
      },
      {
        code: "export * from '../compliance/consent.entity';",
        filename: `${API}/content/publish.ts`,
        errors: [{ messageId: 'moduleInternal' }],
      },
      {
        code: "const m = import('../ledger/journal');",
        filename: `${API}/payout/batch.ts`,
        errors: [{ messageId: 'moduleInternal' }],
      },
      {
        code: "import { a } from '../../../api/src/main';",
        filename: '/repo/apps/web/src/lib/a.ts',
        errors: [{ messageId: 'crossApp' }],
      },
      {
        code: "import { a } from '../../../apps/api/src/main';",
        filename: '/repo/packages/ui/src/a.ts',
        errors: [{ messageId: 'packageToApp' }],
      },
    ],
  });
});
