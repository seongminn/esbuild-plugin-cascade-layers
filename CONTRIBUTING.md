# Contributing to esbuild-plugin-css-layers

Thank you for your interest in contributing! Here's how you can help make this project better.

## Development Setup

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/esbuild-plugin-css-layers.git
cd esbuild-plugin-css-layers
```

2. **Install dependencies**

```bash
npm install
```

3. **Build the project**

```bash
npm run build
```

4. **Run tests**

```bash
npm test
```

5. **Run the example**

```bash
npm run build
node example/build.js
```

## Project Structure

```
esbuild-plugin-css-layers/
├── src/
│   ├── index.ts          # Main plugin implementation
│   └── index.test.ts     # Test suite
├── example/
│   ├── input.css         # Example CSS file
│   ├── build.js          # Example build script
│   └── README.md         # Example documentation
├── dist/                 # Built files (generated)
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── README.md
```

## Development Workflow

### Making Changes

1. **Create a feature branch**

```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**

    - Update the source code in `src/`
    - Add or update tests in `src/index.test.ts`
    - Update documentation if needed

3. **Run tests**

```bash
npm test
npm run lint
npm run typecheck
```

4. **Test with the example**

```bash
npm run build
node example/build.js
# Check generated files in example/dist/
```

### Code Style

- Use TypeScript for all source code
- Follow the existing code style (enforced by ESLint)
- Add JSDoc comments for public APIs
- Write tests for new features

### Testing

- Add unit tests for new functionality
- Ensure all tests pass before submitting
- Test with real CSS files using the example

### Documentation

- Update README.md for new features
- Add examples for new configuration options
- Update CHANGELOG.md with your changes

## Submitting Changes

1. **Commit your changes**

```bash
git add .
git commit -m "feat: add new feature description"
```

2. **Push to your fork**

```bash
git push origin feature/your-feature-name
```

3. **Create a Pull Request**
    - Use a clear, descriptive title
    - Explain what changes you made and why
    - Reference any related issues

## Commit Message Convention

We use conventional commits:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `test:` for test additions/changes
- `refactor:` for code refactoring
- `chore:` for maintenance tasks

## Release Process

1. Update CHANGELOG.md
2. Update version in package.json
3. Create a git tag
4. Push tag to trigger CI/CD
5. Publish to npm

## Getting Help

- Open an issue for bugs or feature requests
- Start a discussion for questions
- Join our community discussions

## Code of Conduct

Please be respectful and inclusive in all interactions. We want this to be a welcoming community for everyone.

Thank you for contributing! 🎉
