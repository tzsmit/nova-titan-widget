# 🔒 Secure Git Commit Instructions for Nova Titan Sports

## ⚠️ CRITICAL: API Key Security

**NEVER commit your actual API key to version control!**

### 📋 Pre-Commit Checklist

Before committing any changes, ALWAYS verify:

1. ✅ **API Key is NOT in any committed files**
2. ✅ **config.js is in .gitignore and NOT tracked**
3. ✅ **No hardcoded secrets in any files**
4. ✅ **All sensitive data is properly excluded**

---

## 🚀 Step-by-Step Commit Process

### 1. **Create Local Config File (DO NOT COMMIT)**

```bash
# Create config.js with your actual API key (this file is gitignored)
echo "window.NOVA_TITAN_API_KEY = 'your_api_key_here';" > config.js
```

### 2. **Verify .gitignore Protection**

```bash
# Check that config.js is properly ignored
git check-ignore config.js
# Should output: config.js

# Verify no secrets are tracked
git status
# config.js should NOT appear in the output
```

### 3. **Remove API Key from index.html Before Committing**

```bash
# Replace the API key in index.html with placeholder
sed -i 's/your_api_key_here/your_api_key_here/g' index.html
```

### 4. **Stage and Commit Files**

```bash
# Add files (config.js will be automatically ignored)
git add .

# Double-check what you're about to commit
git diff --staged | grep -i "your_api_key_here"
# This should return NOTHING. If it returns anything, DO NOT COMMIT!

# Commit your changes
git commit -m "feat: Mobile-optimized sports betting platform with secure configuration

- ✅ Mobile-first responsive design with breakpoints
- ✅ Remove all mock/demo data, show proper loading states  
- ✅ Optimized player props with dropdown selection
- ✅ Fix parlay builder functionality
- ✅ FBS-only college football teams
- ✅ Enhanced error handling and loading states
- ✅ Secure API key management (externalized)
- ✅ Cross-device compatibility improvements"
```

### 5. **Pre-Push Security Verification**

```bash
# Final security check before pushing
git log --oneline -5 | xargs -I {} git show {} | grep -i "your_api_key_here"
# This should return NOTHING. If it finds the API key, DO NOT PUSH!

# Check remote status
git remote -v

# Push to repository
git push origin main
```

---

## 🛡️ Security Best Practices

### **For Production Deployment:**

1. **Use Environment Variables:**
   ```bash
   # Set environment variable on server
   export NOVA_TITAN_API_KEY="your_api_key_here"
   ```

2. **Use index-production.html:**
   - Uses external config.js file
   - Never hardcodes API keys
   - Automatically loads from environment

3. **Server-side Configuration:**
   ```javascript
   // Server should inject the API key at runtime
   window.NOVA_TITAN_API_KEY = process.env.NOVA_TITAN_API_KEY;
   ```

---

## 🚨 Emergency: If API Key Was Accidentally Committed

### **Immediate Actions:**

1. **Rotate the API Key IMMEDIATELY**
   - Go to your API provider dashboard
   - Regenerate/rotate the compromised key
   - Update your local config.js with new key

2. **Remove from Git History**
   ```bash
   # Remove the API key from all commits (DANGEROUS - backup first!)
   git filter-branch --tree-filter 'sed -i "s/your_api_key_here/your_api_key_here/g" index.html' HEAD
   
   # Force push to overwrite remote history (use with caution!)
   git push origin main --force
   ```

3. **Alternative: BFG Repo-Cleaner**
   ```bash
   # Download BFG: https://rtyley.github.io/bfg-repo-cleaner/
   java -jar bfg.jar --replace-text passwords.txt
   git reflog expire --expire=now --all && git gc --prune=now --aggressive
   ```

---

## 📁 Repository Structure

### **Files That Should Be Committed:**
- ✅ `index-production.html` (secure version)
- ✅ `assets/index-mobile-fixed.js` (production bundle)
- ✅ `config.example.js` (template)
- ✅ `.gitignore` (with proper exclusions)
- ✅ Documentation files

### **Files That Should NEVER Be Committed:**
- ❌ `config.js` (contains actual API key)
- ❌ `index.html` (if it contains real API key)
- ❌ Any `.env` files
- ❌ Any files with hardcoded secrets

---

## 🔍 Verification Commands

### **Before Every Commit:**

```bash
# 1. Check for API key in staged files
git diff --staged | grep -i "your_api_key_here"

# 2. Verify .gitignore is working
git ls-files | grep config.js

# 3. Check file contents
grep -r "your_api_key_here" . --exclude-dir=.git

# 4. Verify what's being committed
git status --porcelain
```

### **Expected Results:**
- All commands above should return **NO RESULTS** for API key searches
- `git ls-files | grep config.js` should return nothing
- Only safe files should appear in git status

---

## 🎯 Quick Reference Commands

```bash
# Safe commit workflow
sed -i 's/your_api_key_here/your_api_key_here/g' index.html
git add .
git diff --staged | grep -i "your_api_key_here" || echo "✅ Safe to commit"
git commit -m "your commit message"
git push origin main

# Restore API key for local development
sed -i 's/your_api_key_here/your_api_key_here/g' index.html
```

---

## ⚡ Automation Script

Create this script as `secure-commit.sh`:

```bash
#!/bin/bash
set -e

echo "🔒 Securing files before commit..."

# Replace API key with placeholder
sed -i 's/your_api_key_here/your_api_key_here/g' index.html

# Security check
if git diff --staged | grep -i "your_api_key_here"; then
    echo "❌ API key found in staged files! Aborting."
    exit 1
fi

echo "✅ Files secured. Safe to commit."

# Add files and commit
git add .
git commit -m "${1:-Update: Secure mobile-optimized sports betting platform}"

# Restore API key for local development  
sed -i 's/your_api_key_here/your_api_key_here/g' index.html

echo "🚀 Committed successfully. Local API key restored."
```

**Usage:**
```bash
chmod +x secure-commit.sh
./secure-commit.sh "Your commit message here"
```

---

## 📞 Support

If you encounter any issues with the commit process or accidentally expose secrets:

1. **Stop immediately** - Don't push anything
2. **Follow the emergency procedures** above
3. **Rotate the API key** as a precaution
4. **Review this guide** for proper procedures

Remember: **Security first, always!** 🔒