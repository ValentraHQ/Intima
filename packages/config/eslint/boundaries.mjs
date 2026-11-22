/**
 * INTIMA module-boundary rule (ADR-001, SDD §3).
 *
 * 1. Code inside `src/modules/<A>/` may import another module `<B>` only through
 *    its public entry point (`src/modules/<B>` or `src/modules/<B>/index`).
 * 2. An app (`apps/<X>`) may not import from another app (`apps/<Y>`).
 * 3. A shared package (`packages/<P>`) may not import from any app.
 *
 * Only relative imports are inspected; workspace packages (`@intima/*`) are the
 * sanctioned way to share code between apps.
 */
import path from 'node:path';

const MODULE_RE = /^(.*[\\/]src[\\/]modules)[\\/]([^\\/]+)(?:[\\/](.*))?$/;
const APP_RE = /^(.*)[\\/]apps[\\/]([^\\/]+)(?:[\\/].*)?$/;
const PKG_RE = /^(.*)[\\/]packages[\\/]([^\\/]+)(?:[\\/].*)?$/;
const PUBLIC_ENTRY_RE = /^index(\.[cm]?[jt]sx?)?$/;

const WIN_ABSOLUTE_RE = /^(?:[A-Za-z]:[\\/]|\\\\)/;

/**
 * Pick the path flavour from the filename itself, not from the host OS, so that the
 * same filename resolves identically on Windows and Linux (ESLint passes `C:\...` on
 * Windows and `/...` elsewhere; tests may use either on any host).
 */
function pathFor(file) {
  if (WIN_ABSOLUTE_RE.test(file)) return path.win32;
  if (file.startsWith('/')) return path.posix;
  return path;
}

function check(file, specifier) {
  if (!specifier.startsWith('.')) return null;
  const p = pathFor(file);
  // Normalize the importing file with the same resolver as the target, so both sides
  // of every comparison below use identical separators and drive prefixes.
  const fromFile = p.resolve(file);
  const target = p.resolve(p.dirname(fromFile), specifier);

  const fromMod = MODULE_RE.exec(fromFile);
  const toMod = MODULE_RE.exec(target);
  if (fromMod && toMod && fromMod[1] === toMod[1] && fromMod[2] !== toMod[2]) {
    const rest = toMod[3];
    if (rest !== undefined && rest !== '' && !PUBLIC_ENTRY_RE.test(rest)) {
      return { messageId: 'moduleInternal', data: { from: fromMod[2], to: toMod[2] } };
    }
  }

  const fromApp = APP_RE.exec(fromFile);
  const toApp = APP_RE.exec(target);
  if (fromApp && toApp && fromApp[1] === toApp[1] && fromApp[2] !== toApp[2]) {
    return { messageId: 'crossApp', data: { from: fromApp[2], to: toApp[2] } };
  }

  const fromPkg = PKG_RE.exec(fromFile);
  if (fromPkg && toApp && fromPkg[1] === toApp[1]) {
    return { messageId: 'packageToApp', data: { from: fromPkg[2], to: toApp[2] } };
  }
  return null;
}

/**
 * The specifier of an import source when it is known statically: a string literal, or
 * a template literal without expressions (`import(\`../x\`)`). Computed sources
 * return null and are not checked.
 */
function staticSpecifier(source) {
  if (!source) return null;
  if (source.type === 'Literal') return typeof source.value === 'string' ? source.value : null;
  if (source.type === 'TemplateLiteral' && source.expressions.length === 0) {
    return source.quasis[0]?.value.cooked ?? null;
  }
  return null;
}

/** @type {import('eslint').Rule.RuleModule} */
export const moduleBoundariesRule = {
  meta: {
    type: 'problem',
    docs: { description: 'Enforce INTIMA module and app boundaries' },
    schema: [],
    messages: {
      moduleInternal:
        "Module '{{from}}' may only import module '{{to}}' through its public entry point (modules/{{to}}/index).",
      crossApp:
        "App '{{from}}' must not import from app '{{to}}'. Share code through a package in packages/.",
      packageToApp: "Package '{{from}}' must not import from app '{{to}}'.",
    },
  },
  create(context) {
    const filename = context.filename;
    const report = (node, source) => {
      const specifier = staticSpecifier(source);
      if (specifier === null) return;
      const problem = check(filename, specifier);
      if (problem) context.report({ node: source, ...problem });
    };
    return {
      ImportDeclaration: (node) => report(node, node.source),
      ExportNamedDeclaration: (node) => report(node, node.source),
      ExportAllDeclaration: (node) => report(node, node.source),
      ImportExpression: (node) => report(node, node.source),
    };
  },
};

export const intimaPlugin = { rules: { 'module-boundaries': moduleBoundariesRule } };
