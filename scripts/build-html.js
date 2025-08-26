const fs = require('fs');
const path = require('path');

class HTMLBuilder {
  constructor() {
    this.sourceFile = path.join(__dirname, '../index.html');
    this.outputFile = path.join(__dirname, '../dist/index.html');
  }

  build() {
    try {
      console.log('📄 Processing HTML file...');
      
      // Read the source HTML
      let htmlContent = fs.readFileSync(this.sourceFile, 'utf8');
      
      // Fix all CSS path references to src/styles.css
      htmlContent = htmlContent.replace(
        /href="\.\/src\/styles\.css"/g,
        'href="./styles.css"'
      );
      
      // Write the processed HTML to dist
      fs.writeFileSync(this.outputFile, htmlContent);
      
      console.log('✅ HTML file processed successfully!');
      
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
