# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.x     | Yes       |

## Reporting a Vulnerability

If you discover a security vulnerability in pamangan.com, please report it responsibly.

**Do not open a public GitHub issue for security vulnerabilities.**

### How to Report

Send an email to: **josepaulotimbang@gmail.com**

Include the following in your report:
- A clear description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Any suggested fixes (optional)

### Response Timeline

- **Acknowledgement:** Within 48 hours
- **Initial assessment:** Within 5 business days
- **Resolution:** Critical issues within 7 days; others within 30 days

## Security Best Practices for Contributors

- Never commit `.env` files or files containing real API keys, passwords, or secrets
- Always use environment variables for sensitive configuration (see `.env.example`)
- Validate and sanitize all user inputs on both client and server
- Do not expose internal error messages or stack traces to end users
- Keep all dependencies up to date
- Never commit `.claude/` or any Claude Code configuration files

## Out of Scope

- Denial of service attacks
- Social engineering attacks
- Vulnerabilities in third-party services (MongoDB Atlas, Google Gemini, Groq)
