export default {
  "**/*.ts": ["pnpm exec eslint --fix", "pnpm exec prettier --write"],
  "**/*.{js,mjs,cjs,md,json,yml,yaml}": ["pnpm exec prettier --write"],
};
