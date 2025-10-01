# 🚀 Deploy Your Sanity Studio

Your Sanity Studio is configured but needs to be deployed to make it accessible online.

## Quick Deploy (Recommended)

### Option 1: Using the Deploy Script

```bash
./deploy-sanity.sh
```

When prompted:
1. **Select:** "Create new studio hostname" (or select existing if shown)
2. **Enter hostname:** `d2-sanitizers`
3. Wait for deployment (30-60 seconds)

### Option 2: Manual Deployment

```bash
cd studio
npx sanity deploy
```

When prompted:
1. **Enter hostname:** `d2-sanitizers`
2. Confirm deployment
3. Wait for build and upload

---

## After Deployment

Your studio will be available at:
**https://d2-sanitizers.sanity.studio**

### First Time Access:
1. Visit https://d2-sanitizers.sanity.studio
2. Sign in with your Sanity account (the one you used to create the project)
3. You'll see the studio interface with all your schemas ready!

---

## If You Get "Studio not found" Error

This means the deployment hasn't completed yet. To fix:

### Step 1: Verify Project
```bash
cd studio
npx sanity projects list
```

You should see your project: `91lu7dju - D2 Sanitizers`

### Step 2: Deploy with Build
```bash
cd studio
npx sanity deploy
```

Follow the prompts to complete deployment.

### Step 3: Test Local Studio First
```bash
npm run sanity
```

This starts the studio at http://localhost:3333 - verify it works before deploying.

---

## Alternative: Use Sanity Manage

You can also deploy from the Sanity web interface:

1. Visit https://www.sanity.io/manage/personal/project/91lu7dju
2. Go to "Studio" tab
3. Click "Deploy studio"
4. Follow the prompts

---

## Troubleshooting

### "Cannot find module" errors
```bash
cd studio
npm install
```

### "Build failed" errors
Check that your schemas are valid:
```bash
cd studio
npx sanity schema validate
```

### "Authentication required" errors
```bash
npx sanity login
```

---

## Studio Configuration

Your studio is configured with:
- **Project ID:** 91lu7dju
- **Dataset:** production
- **Hostname:** d2-sanitizers

All configuration is in:
- `studio/sanity.config.ts`
- `studio/sanity.cli.ts`

---

## Next Steps After Deployment

Once deployed successfully:

1. ✅ Visit https://d2-sanitizers.sanity.studio
2. ✅ Sign in with your Sanity account
3. ✅ Start adding content:
   - Products
   - Blog posts
   - FAQs
   - Categories
   - Industries

---

## Quick Reference

### Start Local Studio
```bash
npm run sanity
# Opens at http://localhost:3333
```

### Deploy Studio
```bash
npm run sanity:deploy
# Or use: ./deploy-sanity.sh
```

### Verify Configuration
```bash
cat studio/sanity.config.ts | grep projectId
# Should show: projectId: '91lu7dju',
```

---

## Need Help?

- Sanity Docs: https://www.sanity.io/docs/deployment
- Your Project: https://www.sanity.io/manage/personal/project/91lu7dju
- Community: https://slack.sanity.io/

---

**Ready to deploy!** Run `./deploy-sanity.sh` or follow the manual steps above.