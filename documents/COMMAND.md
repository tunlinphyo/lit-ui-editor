### Verify

```bash
npm test
npm run check
npm run build
```

### Release

```bash
git add package.json package-lock.json vite.config.js src/default/styles/fonts.css
git commit -m "Release v0.1.4"
git tag v0.1.4
git push origin main --tags
```
