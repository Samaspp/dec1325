# 🔒 Privacy Configuration Guide

## Letter Content Privacy

The letter content is stored in a separate configuration file that can be kept private when uploading to GitHub.

### Location
`src/app/config/letter.config.ts`

### How to Keep Your Letter Private

#### Option 1: Gitignore the Config File
Uncomment this line in `.gitignore`:
```
# src/app/config/letter.config.ts
```

This will prevent the file from being tracked by git.

#### Option 2: Use Environment Variables
For sensitive deployments, you can move the content to environment variables:

1. Create a `.env` file (already gitignored)
2. Store letter content there
3. Load it in the component using environment configuration

### Customizing the Letter

Edit `src/app/config/letter.config.ts`:

```typescript
export const LETTER_CONTENT: LetterConfig = {
  greeting: "Dear Joy,",
  paragraphs: [
    "Your personal message here...",
    "Another paragraph...",
    // Add more paragraphs as needed
  ],
  signature: "With love,\nYour Name"
};
```

### GitHub Upload Checklist

Before uploading to GitHub:

- [ ] Replace default letter content with your personal message
- [ ] Decide if you want to keep it private
- [ ] If private: Uncomment the gitignore line
- [ ] If public: Review content for sensitive information
- [ ] Commit and push

### Deployment Note

If you gitignore the config file:
- Keep a backup copy locally
- Recreate it on your deployment server
- Or use environment variables in production

---

**Important:** The default letter in the repository is a placeholder. Replace it with your personal message for Joy!
