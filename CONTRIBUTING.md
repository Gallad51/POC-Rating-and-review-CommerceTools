# 🤝 Contributing to Ratings & Reviews POC

Thank you for your interest in contributing to this proof-of-concept project!

## 🚀 Quick Start

1. **Fork the repository**
2. **Clone your fork locally**
3. **Create a feature branch**: `git checkout -b feature/your-feature-name`
4. **Make your changes**
5. **Test locally**: `npm run build:all && npm run test:all`
6. **Create a Pull Request**

## 📋 Development Workflow

### Prerequisites
- Node.js 18+
- Docker
- Git

### Setup
```bash
# Install all dependencies
npm run install:all

# Build all projects
npm run build:all

# Test everything works
npm run test:all
```

### Making Changes

1. **Backend changes**: Work in `./backend/`
2. **Frontend changes**: Work in `./frontend/`
3. **Infrastructure changes**: Work in `./infra/`
4. **CI/CD changes**: Work in `./.github/workflows/`

### Testing Your Changes

```bash
# Test backend
npm run dev:backend
curl http://localhost:8080/health

# Test frontend
npm run dev:frontend
curl http://localhost:8080/health

# Test Docker builds
npm run docker:build

# Run troubleshooting
npm run troubleshoot
```

## 🔄 Pull Request Process

1. **Automated Testing**: Every PR triggers automatic deployment of preview environments
2. **Review URLs**: GitHub bot will comment with preview URLs for testing
3. **Code Review**: Maintainers will review your changes
4. **Auto-cleanup**: Preview environments are cleaned up when PR is closed/merged

## 📝 Code Style

- **TypeScript** for backend code
- **ESLint** for linting
- **Prettier** for formatting (if available)
- **Conventional Commits** for commit messages

## 🏗️ Architecture Principles

This is a **POC project** with specific constraints:

- ✅ **GCP Free Tier Only**: Stay within free limits
- ✅ **Cloud Run Only**: No complex infrastructure
- ✅ **Minimal Dependencies**: Keep it simple
- ✅ **Documentation**: Document everything

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment details** (local/cloud, OS, Node version)
2. **Steps to reproduce**
3. **Expected vs actual behavior**
4. **Logs/screenshots** if applicable
5. **Troubleshooting results**: Run `./scripts/troubleshoot.sh`

## 💡 Feature Requests

For new features, please:

1. **Check existing issues** first
2. **Describe the use case** clearly
3. **Consider POC constraints** (budget, complexity)
4. **Provide implementation ideas** if possible

## 📖 Documentation

When making changes, please update:

- **README.md** (if architecture changes)
- **infra/README.md** (if infrastructure changes)
- **Component README.md** files (if component-specific changes)
- **Code comments** (for complex logic)

## ❓ Questions

- Check existing **Issues** and **Discussions**
- Run the **troubleshooting script**: `./scripts/troubleshoot.sh`
- Review the **documentation** in each directory

## 🏆 Recognition

All contributors will be recognized in our README.md file. Thank you for helping make this POC better!

---

**Remember**: This is a POC project focused on demonstrating microfrontend architecture with GCP Cloud Run within free tier constraints. Keep changes simple and well-documented! 🎉