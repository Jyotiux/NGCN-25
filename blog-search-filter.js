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
            <div class="text-gray-500">
                <svg class="mx-auto h-20 w-20 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M7 8h10M7 12h6m-6 4h8M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
                </svg>
                </div>
                <div class="text-[#49709c] text-lg font-medium mb-2">
                    <h3 class="text-lg font-medium text-gray-900 mb-2">No Blogs found</h3>
                </div>
                <div class="text-[#49709c] text-sm">
                    Try adjusting your search terms or browse all blogs by clearing the search.
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
document.addEventListener('DOMContentLoaded', function () {
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
    document.addEventListener('DOMContentLoaded', function () {
        document.head.appendChild(style);
    });
}