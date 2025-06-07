// Blog Search Functionality
class BlogSearch {
    constructor() {
        this.searchInput = document.querySelector('input[placeholder="Search blogs"]');
        this.blogGrid = document.querySelector('.grid');
        this.blogCards = Array.from(document.querySelectorAll('.grid a'));
        this.noResultsMessage = null;
        
        this.init();
    }

    init() {
        // Add event listener for search input
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Store original blog data for searching
        this.blogData = this.extractBlogData();
    }

    extractBlogData() {
        return this.blogCards.map(card => {
            const title = card.querySelector('.text-base.font-medium')?.textContent || '';
            const description = card.querySelector('.text-sm.font-normal')?.textContent || '';
            
            return {
                element: card,
                title: title.toLowerCase(),
                description: description.toLowerCase()
            };
        });
    }

    handleSearch(query) {
        const searchTerm = query.toLowerCase().trim();
        
        this.blogData.forEach(blog => {
            const isVisible = searchTerm === '' || 
                            blog.title.includes(searchTerm) || 
                            blog.description.includes(searchTerm);
            
            blog.element.style.display = isVisible ? 'block' : 'none';
        });
        
        this.updateNoResultsMessage(query);
    }

    updateNoResultsMessage(query) {
        const visibleBlogs = this.blogData.filter(blog => 
            blog.element.style.display !== 'none'
        );
        
        // Remove existing no results message
        if (this.noResultsMessage) {
            this.noResultsMessage.remove();
            this.noResultsMessage = null;
        }
        
        // Show no results message if no blogs are visible and there's a search query
        if (visibleBlogs.length === 0 && query.trim() !== '') {
            this.noResultsMessage = document.createElement('div');
            this.noResultsMessage.className = 'col-span-full text-center py-12';
            
            this.noResultsMessage.innerHTML = `
                <div class="text-[#49709c] text-lg font-medium mb-2">
                    No blogs found for "${query}"
                </div>
                <div class="text-[#49709c] text-sm">
                    Try different search terms or 
                    <button class="text-[#0d141c] underline hover:no-underline" onclick="blogSearch.clearSearch()">
                        clear search
                    </button>
                </div>
            `;
            
            this.blogGrid.appendChild(this.noResultsMessage);
        }
    }

    clearSearch() {
        // Clear search input
        if (this.searchInput) {
            this.searchInput.value = '';
        }
        
        // Show all blogs
        this.blogData.forEach(blog => {
            blog.element.style.display = 'block';
        });
        
        // Remove no results message
        if (this.noResultsMessage) {
            this.noResultsMessage.remove();
            this.noResultsMessage = null;
        }
    }

    // Method to add new blog dynamically (if needed)
    addNewBlog(blogElement) {
        const title = blogElement.querySelector('.text-base.font-medium')?.textContent || '';
        const description = blogElement.querySelector('.text-sm.font-normal')?.textContent || '';
        
        const newBlogData = {
            element: blogElement,
            title: title.toLowerCase(),
            description: description.toLowerCase()
        };
        
        this.blogData.push(newBlogData);
        this.blogCards.push(blogElement);
    }

    // Method to get current search query
    getCurrentSearch() {
        return this.searchInput ? this.searchInput.value : '';
    }
}

// Initialize the search functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.blogSearch = new BlogSearch();
});

// Add CSS for smooth animations
const style = document.createElement('style');
style.textContent = `
    .grid a {
        transition: opacity 0.3s ease, transform 0.3s ease;
    }
    
    .grid a[style*="display: none"] {
        opacity: 0;
        transform: scale(0.95);
    }
`;

// Add styles to head when DOM is ready
if (document.head) {
    document.head.appendChild(style);
} else {
    document.addEventListener('DOMContentLoaded', function() {
        document.head.appendChild(style);
    });
}