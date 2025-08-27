# Automatic Template Detection

This project supports **automatic template detection** for the checklists folder! When you add new `.md` files to the `checklists/` folder, the template index will be automatically updated using modern GitHub Actions and Node.js best practices.

## 🚀 Quick Start

1. **Add Template Files**: Simply drop `.md` files into the `checklists/` folder
2. **Automatic Updates**: GitHub Actions will automatically detect new files and update `index.json`
3. **Instant Availability**: New templates become available in the dropdown immediately

## 🔧 How It Works

### GitHub Actions Workflow (Recommended)

The system uses a modern GitHub Actions workflow that:

- **Triggers automatically** when you push changes to `.md` files in `checklists/`
- **Uses Node.js 20** with npm caching for faster builds
- **Includes proper permissions** for repository access
- **Commits changes** with detailed commit messages
- **Supports both main and master branches**

### Manual Updates (Local)

If you prefer to update locally before committing:

```bash
# Update the template index manually
npm run update-templates

# Test changes without modifying files
npm run test

# Or run the script directly
node scripts/update-templates.js
node scripts/update-templates.js --dry-run
```

## Template Metadata

The system automatically extracts metadata from your `.md` files:

- **Title**: Taken from the first `# Header` in the file
- **ID**: Generated from the filename (lowercase, hyphens for spaces)
- **Description**: First substantial paragraph or extracted from HTML comments
- **Filename**: The original filename

### Custom Descriptions

You can specify custom descriptions using HTML comments:

```markdown
<!-- description: Your custom description here -->

# Template Title

Your template content...
```

## 🔄 Complete Workflow (with GitHub Pages)

### **Automatic Flow**

1. **Create template**: Add `checklists/my-new-game.md` with content
2. **Push to GitHub**: Commit and push your changes
3. **Template Update**: GitHub Actions auto-updates `checklists/index.json`
4. **Pages Deploy**: GitHub Pages auto-deploys your updated site
5. **Ready to use**: New template appears in dropdown immediately

### **What Happens Behind the Scenes**

- **Trigger 1**: Your push triggers template update workflow (path filter)
- **Action 1**: Template workflow scans files and updates `index.json`
- **Trigger 2**: Template workflow's commit triggers Pages deployment
- **Action 2**: GitHub Pages deploys your site with new templates
- **Result**: Seamless automatic template detection and deployment!

## 📁 Files Added/Updated

- `.github/workflows/update-templates.yml` - **Auto-activates** when uploaded to GitHub
- `scripts/update-templates.js` - Template scanning and index generation script
- `package.json` - Updated with modern Node.js configuration
- `TEMPLATE_AUTO_DETECTION.md` - This documentation

## 🚀 **Getting Started**

### **Upload to GitHub**

1. **Commit all files** including `.github/` folder
2. **Push to GitHub**
3. **GitHub auto-detects** the workflow
4. **Ready to use!** 🎉

## ✨ Modern Features

✅ **GitHub Actions v4** - Latest action versions
✅ **Node.js 20** - Latest LTS with npm caching
✅ **Explicit Permissions** - Secure repository access
✅ **Dry-run Mode** - Test changes without modifying files
✅ **Detailed Logging** - Clear output for debugging
✅ **Error Handling** - Graceful handling of malformed files
✅ **Branch Support** - Works with both `main` and `master`

## 🎯 Current Templates

The system currently detects these templates automatically:

- **radiant-dawn-plus.md** → "Prologue - Under Gray Skies (Act I)"
- **tmgc.md** → "Prologue"

## 🛠️ Technical Details

### GitHub Actions Workflow

- **Triggers**: On push/PR to `.md` files in `checklists/`
- **Node.js**: Version 20 with npm caching enabled
- **Permissions**: Explicit `contents: write` and `pull-requests: read`
- **Anti-Loop Protection**: Excludes automated commits and uses concurrency control
- **Commit Style**: Conventional commits with `[skip ci]` tags

### Node.js Script

- **Compatibility**: Node.js 16+ with modern JavaScript features
- **Dependencies**: Zero external dependencies (uses only Node.js built-ins)
- **Arguments**: Supports `--dry-run` flag for testing
- **Error Handling**: Comprehensive error handling and logging

### Cost & Performance

- **Free**: Well within GitHub Actions free tier (runs in ~30 seconds)
- **Efficient**: Only processes when `.md` files change
- **Lightweight**: No external API calls or heavy processing

### GitHub Pages Integration

- **Automatic Deployment**: Works seamlessly with GitHub Pages "Deploy from branch"
- **No Conflicts**: Anti-loop protection prevents workflow conflicts
- **Path Optimization**: Only triggers on actual template changes
- **Branch Flexibility**: Supports both `main` and `master` branches

---

**Add more `.md` files to the checklists folder and they'll be automatically included!** 🎮✨
