const fs = require('fs');
const path = require('path');

class HTMLBuilder {
  constructor() {
    this.htmlFiles = [
      {
        source: path.join(__dirname, '../index.html'),
        output: path.join(__dirname, '../dist/index.html')
      },
      {
        source: path.join(__dirname, '../model-profile.html'),
        output: path.join(__dirname, '../dist/model-profile.html')
      },
      {
        source: path.join(__dirname, '../terms-of-service.html'),
        output: path.join(__dirname, '../dist/terms-of-service.html')
      },
      {
        source: path.join(__dirname, '../privacy-policy.html'),
        output: path.join(__dirname, '../dist/privacy-policy.html')
      }
    ];
  }

  build() {
    try {
      console.log('📄 Processing HTML files...');
      
      this.htmlFiles.forEach(({ source, output }) => {
        const fileName = path.basename(source);
        console.log(`   Processing ${fileName}...`);
        
        // Read the source HTML
        let htmlContent = fs.readFileSync(source, 'utf8');
        
        // Fix all CSS path references to src/styles.css
        htmlContent = htmlContent.replace(
          /href="\.\/src\/styles\.css"/g,
          'href="./styles.css"'
        );
        
        // Write the processed HTML to dist
        fs.writeFileSync(output, htmlContent);
        
        console.log(`   ✅ ${fileName} processed successfully!`);
      });
      
      console.log('✅ All HTML files processed successfully!');
      
    } catch (error) {
      console.error('❌ Error processing HTML:', error);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const builder = new HTMLBuilder();
  builder.build();
}

module.exports = HTMLBuilder;
