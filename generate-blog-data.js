const fs = require('fs');
const path = require('path');

const postsDirectory = path.join(__dirname, '_posts');
const outputFile = path.join(__dirname, 'blog-data.json');

function extractFrontMatter(content) {
    const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontMatterRegex);
    
    if (!match) {
        return { metadata: {}, body: content };
    }
    
    const frontMatter = match[1];
    const body = match[2];
    
    const metadata = {};
    const lines = frontMatter.split('\n');
    
    lines.forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex !== -1) {
            const key = line.substring(0, colonIndex).trim();
            let value = line.substring(colonIndex + 1).trim();
            
            // Remove quotes
            value = value.replace(/^["']|["']$/g, '');
            
            metadata[key] = value;
        }
    });
    
    return { metadata, body };
}

function generateBlogData() {
    // Create _posts directory if it doesn't exist
    if (!fs.existsSync(postsDirectory)) {
        fs.mkdirSync(postsDirectory, { recursive: true });
        console.log('Created _posts directory');
    }
    
    // Read all files from _posts
    const files = fs.readdirSync(postsDirectory).filter(file => file.endsWith('.md'));
    
    const posts = files.map(filename => {
        const filePath = path.join(postsDirectory, filename);
        const content = fs.readFileSync(filePath, 'utf8');
        const { metadata, body } = extractFrontMatter(content);
        
        // Extract slug from filename (remove date and .md)
        const slug = filename.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');
        
        return {
            slug: slug,
            title: metadata.title || 'Untitled',
            date: metadata.date || new Date().toISOString(),
            author: metadata.author || '',
            image: metadata.image || '',
            excerpt: metadata.excerpt || '',
            category: metadata.category || '',
            body: body.trim()
        };
    });
    
    // Write to JSON file
    fs.writeFileSync(outputFile, JSON.stringify(posts, null, 2));
    console.log(`✅ Generated blog-data.json with ${posts.length} posts`);
}

// Run the script
try {
    generateBlogData();
} catch (error) {
    console.error('Error generating blog data:', error);
    process.exit(1);
}