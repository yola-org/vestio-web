# Vestio Web Documentation

Welcome to the Vestio Web documentation. This documentation provides comprehensive information about the codebase architecture, modules, components, and best practices.

## Table of Contents

### Getting Started
- [Main README](../README.md) - Project overview, setup, and quick start
- [Development Guide](./guides/DEVELOPMENT.md) - Development workflow, tips, and troubleshooting
- [Best Practices](./guides/BEST_PRACTICES.md) - Coding standards and conventions

### Architecture
- [Architecture Overview](./ARCHITECTURE.md) - High-level architecture, patterns, and design system
- [AI Guidelines](../AI_GUIDELINES.md) - Design system, colors, typography, and component rules

### Core Modules
- [API Layer](./api/API_LAYER.md) - HTTP client, error handling, endpoint definitions
- [Authentication](./modules/AUTH.md) - Auth flow, cookies, and state management
- [Internationalization (i18n)](./modules/I18N.md) - Localization, RTL support, language switching
- [Server Actions](./modules/ACTIONS.md) - Server actions patterns and usage
- [Components Guide](./components/COMPONENTS.md) - Component organization and patterns

## Quick Links

### For Developers
- **New to the project?** Start with [Development Guide](./guides/DEVELOPMENT.md)
- **Adding features?** Check [Best Practices](./guides/BEST_PRACTICES.md)
- **Working with API?** See [API Layer](./api/API_LAYER.md)
- **Styling?** See [Architecture - Design System](./ARCHITECTURE.md#design-system) and [AI Guidelines](../AI_GUIDELINES.md)

### Key Concepts
- **Framework**: Next.js 15 App Router
- **Styling**: Tailwind CSS v4 with custom design tokens
- **i18n**: next-intl (French/Arabic, RTL support)
- **Auth**: Cookie-based authentication
- **API**: Centralized client with error handling

## Contributing to Documentation

When adding new features or modules:
1. Update relevant documentation files
2. Add new documentation files if creating major modules
3. Keep examples up to date
4. Follow the existing documentation style
5. Update this index if adding new documents
