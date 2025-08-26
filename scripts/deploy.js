#!/usr/bin/env node

// Deployment script for ModelArena
// Builds the project and prepares it for deployment

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class Deployer {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.buildDir = path.join(this.projectRoot, 'dist');
  }

  async deploy() {
    console.log('🚀 Starting deployment process...\n');

    try {
      // Step 1: Clean previous build
      this.cleanBuild();

      // Step 2: Build CSS
      this.buildCSS();

      // Step 3: Optimize images
      this.optimizeImages();

      // Step 4: Validate HTML
      this.validateHTML();

      // Step 5: Generate build info
      this.generateBuildInfo();

      // Step 6: Create deployment package
      this.createDeploymentPackage();

      console.log('\n✅ Deployment process completed successfully!');
      console.log('\n📁 Your build is ready in the dist/ directory');
      console.log('📝 Upload the contents to your web server');

    } catch (error) {
      console.error('\n❌ Deployment failed:', error.message);
      process.exit(1);
    }
  }

  cleanBuild() {
    console.log('🧹 Cleaning previous build...');
    
    if (fs.existsSync(this.buildDir)) {
      fs.rmSync(this.buildDir, { recursive: true, force: true });
    }
    
    fs.mkdirSync(this.buildDir, { recursive: true });
    console.log('   Build directory cleaned');
  }

  buildCSS() {
    console.log('🎨 Building CSS...');
    
    try {
      execSync('npm run build:css', { 
        cwd: this.projectRoot,
        stdio: 'inherit'
      });
      console.log('   CSS built successfully');
    } catch (error) {
      throw new Error('CSS build failed');
    }
  }

  optimizeImages() {
    console.log('🖼️  Optimizing images...');
    
    try {
      execSync('npm run optimize:images', { 
        cwd: this.projectRoot,
        stdio: 'inherit'
      });
      console.log('   Images optimized');
    } catch (error) {
      console.log('   Image optimization skipped (optional)');
    }
  }

  validateHTML() {
    console.log('✅ Validating HTML...');
    
    const htmlPath = path.join(this.projectRoot, 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Basic HTML validation
    const checks = [
      { test: /<html[^>]*lang=/, message: 'HTML lang attribute' },
      { test: /<meta[^>]*charset=/, message: 'Charset meta tag' },
      { test: /<meta[^>]*viewport=/, message: 'Viewport meta tag' },
      { test: /<title>/, message: 'Title tag' },
      { test: /<meta[^>]*description=/, message: 'Description meta tag' }
    ];
    
    checks.forEach(check => {
      if (!check.test.test(htmlContent)) {
        console.warn(`   ⚠️  Missing: ${check.message}`);
      }
    });
    
    console.log('   HTML validation completed');
  }

  generateBuildInfo() {
    console.log('📋 Generating build info...');
    
    const buildInfo = {
      version: '1.0.0',
      buildDate: new Date().toISOString(),
      environment: 'production',
      features: [
        'Responsive design',
        'Lazy loading',
        'Service worker',
        'PWA support',
        'SEO optimized',
        'Accessibility compliant'
      ]
    };
    
    fs.writeFileSync(
      path.join(this.buildDir, 'build-info.json'),
      JSON.stringify(buildInfo, null, 2)
    );
    
    console.log('   Build info generated');
  }

  createDeploymentPackage() {
    console.log('📦 Creating deployment package...');
    
    // Copy essential files to dist directory
    const filesToCopy = [
      'index.html',
      'manifest.json',
      'sw.js',
      'js',
      'assets'
    ];
    
    filesToCopy.forEach(file => {
      const src = path.join(this.projectRoot, file);
      const dest = path.join(this.buildDir, file);
      
      if (fs.existsSync(src)) {
        if (fs.statSync(src).isDirectory()) {
          this.copyDirectory(src, dest);
        } else {
          this.copyFile(src, dest);
        }
      }
    });
    
    // Create deployment instructions
    const instructions = `# ModelArena Deployment Instructions

## Files included:
- index.html (main page)
- dist/css/style.css (compiled styles)
- js/main.js (application logic)
- assets/ (images and static files)
- manifest.json (PWA manifest)
- sw.js (service worker)

## Deployment steps:
1. Upload all files to your web server
2. Ensure index.html is the entry point
3. Configure server for proper MIME types
4. Enable GZIP compression
5. Set appropriate cache headers

## Server configuration examples:

### Nginx:
\`\`\`nginx
location ~* \\.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location / {
    try_files $uri $uri/ /index.html;
}
\`\`\`

### Apache (.htaccess):
\`\`\`apache
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/* "access plus 1 year"
</IfModule>

<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^index\\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
\`\`\`

Built on ${new Date().toISOString()}
`;
    
    fs.writeFileSync(
      path.join(this.buildDir, 'DEPLOYMENT.md'),
      instructions
    );
    
    console.log('   Deployment package created');
  }

  copyFile(src, dest) {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }

  copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const files = fs.readdirSync(src);
    files.forEach(file => {
      const srcFile = path.join(src, file);
      const destFile = path.join(dest, file);
      
      if (fs.statSync(srcFile).isDirectory()) {
        this.copyDirectory(srcFile, destFile);
      } else {
        this.copyFile(srcFile, destFile);
      }
    });
  }
}

// Run if called directly
if (require.main === module) {
  const deployer = new Deployer();
  deployer.deploy();
}

module.exports = Deployer;
