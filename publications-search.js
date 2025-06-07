// Publications Search Functionality
class PublicationsSearch {
    constructor() {
        this.searchInput = null;
        this.publications = [];
        this.yearSections = [];
        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        // Get search input element
        this.searchInput = document.querySelector('input[placeholder="Search publications"]');
        
        if (!this.searchInput) {
            console.error('Search input not found');
            return;
        }

        // Extract publications data
        this.extractPublications();
        
        // Add event listeners
        this.addEventListeners();
        
        console.log(`Search initialized with ${this.publications.length} publications`);
    }

    extractPublications() {
        // Get all year sections
        const yearHeaders = document.querySelectorAll('h2[class*="text-[22px]"]');
        
        yearHeaders.forEach(yearHeader => {
            const year = yearHeader.textContent.trim();
            const yearSection = {
                year: year,
                element: yearHeader,
                publications: []
            };

            // Get all publication divs after this year header until next year header
            let currentElement = yearHeader.nextElementSibling;
            
            while (currentElement && !currentElement.matches('h2[class*="text-[22px]"]')) {
                if (currentElement.matches('.flex.gap-4.bg-gray-50')) {
                    const pubData = this.extractPublicationData(currentElement);
                    if (pubData) {
                        pubData.year = year;
                        pubData.element = currentElement;
                        this.publications.push(pubData);
                        yearSection.publications.push(pubData);
                    }
                }
                currentElement = currentElement.nextElementSibling;
            }
            
            this.yearSections.push(yearSection);
        });
    }

    extractPublicationData(element) {
        const titleElement = element.querySelector('p.text-base.font-medium');
        const authorElement = element.querySelector('p.text-sm:nth-of-type(1)');
        const venueElement = element.querySelector('p.text-sm:nth-of-type(2)');

        if (!titleElement) return null;

        return {
            title: titleElement.textContent.trim(),
            authors: authorElement ? authorElement.textContent.replace('Authors: ', '').trim() : '',
            venue: venueElement ? venueElement.textContent.trim() : '',
            searchText: ''
        };
    }

    addEventListeners() {
        // Real-time search as user types
        this.searchInput.addEventListener('input', (e) => {
            this.performSearch(e.target.value);
        });

        // Handle search on Enter key
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.performSearch(e.target.value);
            }
        });

        // Clear search when input is cleared
        this.searchInput.addEventListener('focus', () => {
            this.searchInput.select();
        });
    }

    performSearch(query) {
        const searchTerm = query.toLowerCase().trim();
        
        if (searchTerm === '') {
            this.showAllPublications();
            return;
        }

        let hasResults = false;
        const matchCounts = new Map();

        // Initialize match counts for each year
        this.yearSections.forEach(yearSection => {
            matchCounts.set(yearSection.year, 0);
        });

        // Search through publications
        this.publications.forEach(pub => {
            const searchableText = `${pub.title} ${pub.authors} ${pub.venue}`.toLowerCase();
            const matches = this.searchMatches(searchableText, searchTerm);
            
            if (matches) {
                this.showPublication(pub.element);
                matchCounts.set(pub.year, matchCounts.get(pub.year) + 1);
                hasResults = true;
            } else {
                this.hidePublication(pub.element);
            }
        });

        // Show/hide year sections based on results
        this.yearSections.forEach(yearSection => {
            const matchCount = matchCounts.get(yearSection.year);
            if (matchCount > 0) {
                this.showYearSection(yearSection.element);
                this.updateYearHeader(yearSection.element, yearSection.year, matchCount);
            } else {
                this.hideYearSection(yearSection.element);
            }
        });

        // Show no results message if needed
        this.handleNoResults(hasResults);
    }

    searchMatches(text, searchTerm) {
        // Support multiple search terms (space-separated)
        const terms = searchTerm.split(/\s+/).filter(term => term.length > 0);
        
        // All terms must match (AND logic)
        return terms.every(term => text.includes(term));
    }

    showPublication(element) {
        element.style.display = 'flex';
        element.classList.remove('search-hidden');
        
        // Add subtle highlight animation
        element.style.animation = 'fadeIn 0.3s ease-in';
    }

    hidePublication(element) {
        element.style.display = 'none';
        element.classList.add('search-hidden');
    }

    showYearSection(element) {
        element.style.display = 'block';
        element.classList.remove('search-hidden');
    }

    hideYearSection(element) {
        element.style.display = 'none';
        element.classList.add('search-hidden');
    }

    updateYearHeader(element, year, count) {
        const originalText = year;
        element.innerHTML = `${originalText} <span class="text-sm font-normal text-gray-500">(${count} result${count !== 1 ? 's' : ''})</span>`;
    }

    showAllPublications() {
        // Show all publications and year headers
        this.publications.forEach(pub => {
            this.showPublication(pub.element);
        });

        this.yearSections.forEach(yearSection => {
            this.showYearSection(yearSection.element);
            // Reset year header to original text
            yearSection.element.textContent = yearSection.year;
        });

        this.removeNoResultsMessage();
    }

    handleNoResults(hasResults) {
        if (!hasResults) {
            this.showNoResultsMessage();
        } else {
            this.removeNoResultsMessage();
        }
    }

    showNoResultsMessage() {
        // Remove existing no results message
        this.removeNoResultsMessage();

        const noResultsDiv = document.createElement('div');
        noResultsDiv.id = 'no-results-message';
        noResultsDiv.className = 'text-center py-8 px-4';
        noResultsDiv.innerHTML = `
            <div class="text-gray-500">
                <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No publications found</h3>
                <p class="text-sm text-gray-600">Try adjusting your search terms or browse all publications by clearing the search.</p>
            </div>
        `;

        // Insert after the search input
        const searchContainer = this.searchInput.closest('.px-4.py-3');
        searchContainer.insertAdjacentElement('afterend', noResultsDiv);
    }

    removeNoResultsMessage() {
        const existingMessage = document.getElementById('no-results-message');
        if (existingMessage) {
            existingMessage.remove();
        }
    }

    // Public method to get search statistics
    getSearchStats() {
        return {
            totalPublications: this.publications.length,
            yearSections: this.yearSections.length,
            years: this.yearSections.map(section => section.year)
        };
    }

    // Public method to highlight search terms in results
    highlightSearchTerms(query) {
        if (!query.trim()) return;

        const terms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
        
        this.publications.forEach(pub => {
            if (pub.element.style.display !== 'none') {
                const titleElement = pub.element.querySelector('p.text-base.font-medium');
                const authorElement = pub.element.querySelector('p.text-sm:nth-of-type(1)');
                
                if (titleElement) {
                    this.highlightText(titleElement, terms);
                }
                if (authorElement) {
                    this.highlightText(authorElement, terms);
                }
            }
        });
    }

    highlightText(element, terms) {
        const originalText = element.textContent;
        let highlightedText = originalText;

        terms.forEach(term => {
            const regex = new RegExp(`(${this.escapeRegExp(term)})`, 'gi');
            highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
        });

        if (highlightedText !== originalText) {
            element.innerHTML = highlightedText;
        }
    }

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

// Add CSS for animations and highlights
const style = document.createElement('style');
// style.textContent = `
//     @keyframes fadeIn {
//         from { opacity: 0.5; transform: translateY(-5px); }
//         to { opacity: 1; transform: translateY(0); }
//     }
    
//     .search-hidden {
//         display: none !important;
//     }
    
//     mark {
//         background-color: #fef08a !important;
//         padding: 2px 4px;
//         border-radius: 3px;
//         font-weight: 500;
//     }
    
//     /* Enhanced search input focus state */
//     input[placeholder="Search publications"]:focus {
//         box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
//         border-color: #3b82f6;
//     }
// `;

document.head.appendChild(style);

// Initialize search functionality
const publicationsSearch = new PublicationsSearch();

// Make it globally accessible for debugging
window.publicationsSearch = publicationsSearch;