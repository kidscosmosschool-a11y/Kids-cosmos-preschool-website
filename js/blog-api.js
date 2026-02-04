// Blog API for Netlify CMS
// Fetches and displays blog posts

async function getBlogPosts() {
    try {
        const response = await fetch('/blog-data.json');
        if (!response.ok) {
            console.warn('No blog posts found yet');
            return [];
        }
        const posts = await response.json();
        return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        return [];
    }
}

async function getBlogPost(slug) {
    try {
        const posts = await getBlogPosts();
        return posts.find(post => post.slug === slug) || null;
    } catch (error) {
        console.error(`Error fetching blog post ${slug}:`, error);
        return null;
    }
}

async function searchBlogPosts(keyword) {
    try {
        const posts = await getBlogPosts();
        const lowerKeyword = keyword.toLowerCase();
        return posts.filter(post => {
            return post.title.toLowerCase().includes(lowerKeyword) ||
                   (post.excerpt && post.excerpt.toLowerCase().includes(lowerKeyword)) ||
                   post.body.toLowerCase().includes(lowerKeyword);
        });
    } catch (error) {
        console.error('Error searching posts:', error);
        return [];
    }
}

function formatDate(dateString) {
    if (!dateString) return 'Date not available';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function formatDateShort(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
    });
}

function truncateText(text, maxLength = 150) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

function markdownToHtml(markdown) {
    if (!markdown) return '';
    let html = markdown;
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>');
    
    // Line breaks and paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');
    
    // Wrap in paragraphs
    html = '<p>' + html + '</p>';
    
    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>\s*<\/p>/g, '');
    
    return html;
}