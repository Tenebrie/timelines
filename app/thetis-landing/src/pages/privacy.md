---
title: 'Privacy Policy'
layout: '~/layouts/MarkdownLayout.astro'
---

_Last updated_: January 2025

## Introduction

This Privacy Policy describes how the Neverkin platform ("Service") collects, uses, and protects your information. Neverkin is an open-source project committed to transparency and user privacy.

## Information We Collect

### Account Information

When you create an account, we collect:

- Email address
- Password (stored securely using bcrypt hashing)
- Display name (if provided)

### Content Data

All worlds, events, characters, wiki articles, and other creative content you create within the Service is stored in our database to provide the Service to you.

### Usage Data

We may collect basic usage data such as:

- IP address and browser information (for security and debugging)
- Authentication tokens (stored as HTTP-only cookies)

### What We Do NOT Collect

- We do not use third-party analytics or tracking services
- We do not serve advertisements
- We do not sell or share your personal data with third parties
- We do not use cookies for tracking purposes (only for authentication)

## How We Use Your Information

Your information is used solely to:

- Provide and maintain the Service
- Authenticate your identity
- Enable collaboration features you choose to use
- Protect against abuse and unauthorized access

## Data Storage & Security

- Your data is stored in a PostgreSQL database on secured servers
- Passwords are hashed using bcrypt and never stored in plain text
- Authentication uses secure HTTP-only JWT cookies
- File uploads are stored in encrypted S3-compatible storage

## Your Rights

You have the right to:

- Access all content you've created
- Delete your account and associated data
- Export your data (feature on our roadmap)
- Control who can access your worlds through permission settings

## Open Source Transparency

Neverkin is open source under the GPL-3.0 license. You can review exactly how your data is handled by examining our [source code](https://github.com/tenebrie/timelines). You may also self-host the Service if you prefer full control over your data.

## Children's Privacy

The Service is not intended for users under 13 years of age. We do not knowingly collect personal information from children under 13.

## Changes to This Policy

We may update this Privacy Policy from time to time. Changes will be reflected by updating the "Last updated" date above.

## Contact

For privacy-related questions, please open an issue on our [GitHub repository](https://github.com/tenebrie/timelines) or contact the maintainer at tianara@tenebrie.com.
