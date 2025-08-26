#!/usr/bin/env node

// GitHub Pages deployment script for ModelArena
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class GitHubPagesDeployer {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.distDir = path.join(this.projectRoot, 'dist');
  }

  async deploy() {
    console.log('🚀 Starting GitHub Pages deployment...\n');

    try {
      // Step 1: Check git status
      this.checkGitStatus();

      // Step 2: Build the project
      this.buildProject();

      // Step 3: Commit and push changes
      this.commitAndPush();

      console.log('\n✅ Deployment completed successfully!');
      console.log('🌐 Your site will be available at: https://[your-username].github.io/[your-repo-name]');
      console.log('📝 Check GitHub Actions tab for deployment status');

    } catch (error) {
      console.error('\n❌ Deployment failed:', error.message);
      process.exit(1);
    }
  }

  checkGitStatus() {
    console.log('📋 Checking git status...');
    
    try {
      const status = execSync('git status --porcelain', { 
        cwd: this.projectRoot,
        encoding: 'utf8'
      });
      
      if (status.trim()) {
        console.log('📝 Found uncommitted changes, staging them...');
        execSync('git add .', { cwd: this.projectRoot });
      } else {
        console.log('   Working tree is clean');
      }
    } catch (error) {
      throw new Error('Git status check failed');
    }
  }

  buildProject() {
    console.log('🔧 Building project...');
    
    try {
      execSync('npm run build', { 
        cwd: this.projectRoot,
        stdio: 'inherit'
      });
      console.log('✅ Build completed successfully');
    } catch (error) {
      throw new Error('Build failed');
    }
  }

  commitAndPush() {
    console.log('📤 Committing and pushing changes...');
    
    try {
      // Check if there are changes to commit
      const status = execSync('git status --porcelain', { 
        cwd: this.projectRoot,
        encoding: 'utf8'
      });
      
      if (status.trim()) {
        const timestamp = new Date().toISOString().split('T')[0];
        const commitMessage = `Deploy: Update build ${timestamp}`;
        
        execSync(`git commit -m "${commitMessage}"`, { 
          cwd: this.projectRoot,
          stdio: 'inherit'
        });
        
        execSync('git push origin main', { 
          cwd: this.projectRoot,
          stdio: 'inherit'
        });
        
        console.log('✅ Changes pushed to GitHub');
      } else {
        console.log('   No changes to commit');
      }
    } catch (error) {
      throw new Error('Git commit/push failed');
    }
  }
}

// Helper function to check if GitHub Pages is enabled
function checkGitHubPagesStatus() {
  console.log('\n📚 GitHub Pages Setup Instructions:');
  console.log('1. Go to your repository on GitHub');
  console.log('2. Click on "Settings" tab');
  console.log('3. Scroll down to "Pages" section');
  console.log('4. Under "Source", select "GitHub Actions"');
  console.log('5. Your site will be deployed automatically on every push to main branch');
  console.log('\n💡 The GitHub Actions workflow will handle the build and deployment process');
}

// Run if called directly
if (require.main === module) {
  const deployer = new GitHubPagesDeployer();
  deployer.deploy().then(() => {
    checkGitHubPagesStatus();
  });
}

module.exports = GitHubPagesDeployer;