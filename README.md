# Library template

An NPM library template using Bun.

## Scripts

All script sources and usage.

### [Build](./scripts/build.ts)

Emit `.js` and `.d.ts` files to [`lib`](./lib).

### [Publish](./scripts/publish.ts)

Move [`package.json`](./package.json), [`README.md`](./README.md) to [`lib`](./lib) and publish the package.

### [Bench](./scripts/bench.ts)

Run files that ends with `.bench.ts` extension.

To run a specific file.
```bash
bun bench index # Run bench/index.bench.ts
```

To run the benchmark in `node`, add a `--node` parameter
```bash
bun bench --node

bun bench --node index # Run bench/index.bench.ts with node
```
