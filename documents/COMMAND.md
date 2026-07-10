# Local Package Linking

Use `npm link` to test this package in another local application without publishing it.

## Link the package

From this repository:

```sh
npm install
npm run build
npm link
```

From the consuming application:

```sh
npm link lit-ui-editor
```

Confirm that the app resolves the linked package:

```sh
npm ls lit-ui-editor
```

## Test package changes

After changing this package, rebuild it before testing the consuming application:

```sh
npm run build
```

Run the package test suite before testing the consuming application:

```sh
npm test
```

For repeated changes, run the library build in watch mode in one terminal:

```sh
npm run build -- --watch
```

Run the consuming application's development server in another terminal. Reload the
app after the linked package rebuilds.

## Remove the link

From the consuming application:

```sh
npm unlink lit-ui-editor
npm install
```

From this repository, remove the global package link when it is no longer needed:

```sh
npm unlink
```
