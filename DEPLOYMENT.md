# ModelArena - Deployment Guide

## GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Automatic Deployment Setup

1. **Push to GitHub**: All changes pushed to the `main` branch will automatically trigger a deployment.

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click on **Settings** tab
   - Scroll down to **Pages** section
   - Under **Source**, select **GitHub Actions**
   - Your site will be deployed automatically

3. **Monitor Deployment**: 
   - Check the **Actions** tab in your GitHub repository
   - Each push creates a new workflow run
   - Green checkmark = successful deployment
   - Red X = deployment failed (check logs)

### Manual Deployment

If you want to deploy manually:

```bash
# Build and deploy in one command
npm run deploy

# Or step by step:
npm run build        # Build the project
git add .           # Stage changes
git commit -m "Deploy update"
git push origin main # Push to trigger deployment
```

### Local Preview

Test your built site locally before deploying:

```bash
# Build and serve the production version
npm run preview

# Or serve the dist folder directly
npm run serve:dist
```

### Available Scripts

- `npm run build` - Build the production version
- `npm run deploy` - Build and deploy to GitHub
- `npm run preview` - Build and serve locally
- `npm run serve:dist` - Serve the built dist folder
- `npm run dev` - Start development server

### Site URL

Once deployed, your site will be available at:
```
https://[your-username].github.io/[repository-name]
```

### Deployment Process

The GitHub Actions workflow automatically:

1. ✅ Checks out the code
2. ✅ Sets up Node.js environment
3. ✅ Installs dependencies
4. ✅ Builds the project (`npm run build`)
5. ✅ Deploys to GitHub Pages

### Troubleshooting

**Deployment fails?**
- Check the Actions tab for error logs
- Ensure all dependencies are in `package.json`
- Verify the build process works locally (`npm run build`)

**Site not updating?**
- GitHub Pages can take a few minutes to update
- Check if the workflow completed successfully
- Try a hard refresh (Ctrl+F5 or Cmd+Shift+R)

**Build errors?**
- Make sure all files are committed
- Check for missing dependencies
- Verify paths in HTML are correct

### Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file to the `dist` folder with your domain
2. Update your domain's DNS to point to GitHub Pages
3. Configure custom domain in repository settings

---

Built with ❤️ using Tailwind CSS and modern web technologies.
