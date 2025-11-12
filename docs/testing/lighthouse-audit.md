# Lighthouse Performance Audit Guide

This guide explains how to run Lighthouse audits to measure FitForge's frontend performance.

## Performance Budget

FitForge targets the following Core Web Vitals thresholds:

| Metric | Target | Description |
|--------|--------|-------------|
| **First Contentful Paint (FCP)** | <1.5s | When user sees first content |
| **Largest Contentful Paint (LCP)** | <2.5s | When main content loads (page load target) |
| **Time to Interactive (TTI)** | <3.5s | When page becomes fully interactive |
| **Total Blocking Time (TBT)** | <200ms | How long main thread is blocked |
| **Cumulative Layout Shift (CLS)** | <0.1 | Visual stability score (lower is better) |

## Run Audit via Chrome DevTools

1. Open Chrome and navigate to http://localhost:3000
2. Open DevTools (F12 or Ctrl+Shift+I)
3. Click the "Lighthouse" tab
4. Select "Performance" category
5. Choose "Desktop" or "Mobile" device
6. Click "Analyze page load"
7. Review results and check if metrics meet targets

## Run from CLI

For automated audits and CI/CD integration:

### Install Lighthouse CLI

```bash
npm install -g lighthouse
```

### Run Audit

```bash
lighthouse http://localhost:3000 --only-categories=performance --output=html --output-path=./lighthouse-report.html
```

### View Report

Open `lighthouse-report.html` in your browser to see detailed performance analysis.

### Headless Mode (CI/CD)

```bash
lighthouse http://localhost:3000 --only-categories=performance --output=json --output-path=./lighthouse-report.json --chrome-flags="--headless"
```

## Interpreting Results

- **90-100 (Green)**: Excellent performance
- **50-89 (Orange)**: Needs improvement
- **0-49 (Red)**: Poor performance, requires optimization

## Common Optimizations

If performance targets are not met, consider:

- **React.memo()** for expensive components
- **useMemo()** for expensive calculations
- **useCallback()** for event handlers
- **Code splitting** with React.lazy()
- **Image optimization** (WebP format, lazy loading)
- **Bundle size reduction** (analyze with webpack-bundle-analyzer)
- **Minimize JavaScript** execution time

## References

- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/overview/)
- [Performance Optimization](https://web.dev/fast/)
