let currentPage = 1;
let currentBatch = 'all';
const itemsPerPage = 5;
let searchQuery = '';
// container.innerHTML = '';


// Function to get filtered students based on batch
function getFilteredStudents() {
    let filtered = teamMembers;

    if (currentBatch !== 'all') {
        filtered = filtered.filter(member => member.batch === currentBatch);
    }

    if (searchQuery.trim() !== '') {
        const q = searchQuery.trim().toLowerCase();
        filtered = filtered.filter(member =>
            member.name.toLowerCase().includes(q) ||
            member.expertise.toLowerCase().includes(q)
        );
    }

    return filtered;
}

// Function to render team members with fade-in animation
function renderTeamMembers() {
    const container = document.getElementById('team-members-container');
    const filteredStudents = getFilteredStudents();
    const totalStudents = filteredStudents.length;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentStudents = filteredStudents.slice(startIndex, endIndex);

    container.innerHTML = '';

    // 🔍 Show fallback message if no matching students
    if (totalStudents === 0) {
        const message = document.createElement('div');
        message.className = 'text-center text-[#6b7580] text-sm p-6';
        message.innerHTML = `
        <div class="text-gray-500 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M9 12h6m-6 4h6M8 16v1a2 2 0 002 2h4a2 2 0 002-2v-1M12 4v4m0 0l-2-2m2 2l2-2M4 6h16M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No name, expertise found</h3>
            <p class="text-sm text-gray-600">Try adjusting your search terms or browse all Name, E by clearing the search.</p>
        </div>
        `;


        container.appendChild(message);

        document.getElementById('showing-range').textContent = `0-0`;
        document.getElementById('total-students').textContent = `0`;
        return;
    }

    // 👤 Display student cards
    currentStudents.forEach((member, index) => {
        const memberCard = document.createElement('div');
        memberCard.className = 'p-4 opacity-0 animate-fade-in';
        memberCard.style.animationDelay = `${index * 0.1}s`;

        memberCard.innerHTML = `
            <div class="flex items-stretch justify-between gap-4 rounded-xl bg-white p-4 shadow-[0_0_4px_rgba(0,0,0,0.1)] transition-all duration-300">
                <!-- Left Column: Info -->
                <div class="flex flex-[2_2_0px] flex-col gap-4">
                    <!-- Name + Expertise + Description -->
                    <div class="flex flex-col gap-1">
                        <p class="text-[#131416] text-base font-bold leading-tight">${member.name}</p>
                        <p class="text-[#6b7580] text-sm font-normal leading-normal">Batch: ${member.batch}</p>
                        <p class="text-[#6b7580] text-sm font-normal leading-normal">Expertise: ${member.expertise}</p>
                        <p class="text-[#6b7580] text-sm font-normal leading-normal">
                            ${member.description}
                        </p>
                    </div>
                    <!-- Contact Button -->
                    <button class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 flex-row-reverse bg-[#f1f2f3] text-[#131416] pr-2 gap-1 text-sm font-medium leading-normal w-fit hover:bg-[#e5e7eb] transition-all">
                        <div class="text-[#131416]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256">
                                <path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48Zm-96,85.15L52.57,64H203.43ZM98.71,128,40,181.81V74.19Zm11.84,10.85,12,11.05a8,8,0,0,0,10.82,0l12-11.05,58,53.15H52.57ZM157.29,128,216,74.18V181.82Z"></path>
                            </svg>
                        </div>
                        <span class="truncate">${member.email}</span>
                    </button>
                </div>

                <!-- Right Column: Profile Photo -->
                <div class="w-[150px] aspect-[1] bg-center bg-no-repeat bg-cover rounded-xl hover:scale-105 transition-transform duration-300"
                    style='background-image: url("${member.photo}");'></div>
            </div>
        `;
        container.appendChild(memberCard);
    });

    // 📊 Update showing range
    const showingStart = totalStudents > 0 ? startIndex + 1 : 0;
    const showingEnd = Math.min(endIndex, totalStudents);
    document.getElementById('showing-range').textContent = `${showingStart}-${showingEnd}`;
    document.getElementById('total-students').textContent = totalStudents;
}


// Enhanced pagination function with better styling
function renderPagination() {
    const container = document.getElementById('pagination');
    const filteredStudents = getFilteredStudents();
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

    container.innerHTML = '';

    if (totalPages <= 1) return;

    // Previous button
    const prevButton = document.createElement('button');
    prevButton.className = `flex size-10 items-center justify-center ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 text-[#111418]'} rounded-full transition-colors`;
    prevButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256">
              <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"></path>
            </svg>
          `;
    if (currentPage > 1) {
        prevButton.onclick = () => {
            currentPage--;
            renderTeamMembers();
            renderPagination();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
    }
    container.appendChild(prevButton);

    // Page numbers with ellipsis support
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    // Add first page if not in range
    if (startPage > 1) {
        const firstPageButton = document.createElement('button');
        firstPageButton.className = 'text-sm font-normal leading-normal flex size-10 items-center justify-center text-[#111418] rounded-full hover:bg-gray-100 transition-colors';
        firstPageButton.textContent = '1';
        firstPageButton.onclick = () => {
            currentPage = 1;
            renderTeamMembers();
            renderPagination();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        container.appendChild(firstPageButton);

        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'flex size-10 items-center justify-center text-[#111418]';
            ellipsis.textContent = '...';
            container.appendChild(ellipsis);
        }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `text-sm font-${i === currentPage ? 'bold' : 'normal'} leading-normal flex size-10 items-center justify-center text-[#111418] rounded-full ${i === currentPage ? 'bg-[#dce8f3] text-[#101518]' : 'hover:bg-gray-100'} transition-colors`;
        pageButton.textContent = i;
        pageButton.onclick = () => {
            currentPage = i;
            renderTeamMembers();
            renderPagination();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        container.appendChild(pageButton);
    }

    // Add last page if not in range
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'flex size-10 items-center justify-center text-[#111418]';
            ellipsis.textContent = '...';
            container.appendChild(ellipsis);
        }

        const lastPageButton = document.createElement('button');
        lastPageButton.className = 'text-sm font-normal leading-normal flex size-10 items-center justify-center text-[#111418] rounded-full hover:bg-gray-100 transition-colors';
        lastPageButton.textContent = totalPages;
        lastPageButton.onclick = () => {
            currentPage = totalPages;
            renderTeamMembers();
            renderPagination();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        container.appendChild(lastPageButton);
    }

    // Next button
    const nextButton = document.createElement('button');
    nextButton.className = `flex size-10 items-center justify-center ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 text-[#111418]'} rounded-full transition-colors`;
    nextButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256">
              <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path>
            </svg>
          `;
    if (currentPage < totalPages) {
        nextButton.onclick = () => {
            currentPage++;
            renderTeamMembers();
            renderPagination();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
    }
    container.appendChild(nextButton);
}
function handleSearch(value) {
    searchQuery = value;
    currentPage = 1; // reset to first page on new search
    renderTeamMembers();
    renderPagination();
}

// Function to handle batch filter
function handleBatchFilter(batch) {
    currentBatch = batch;
    currentPage = 1;

    // Update active tab styling
    document.querySelectorAll('[id^="batch-"]').forEach(btn => {
        btn.className = 'px-4 py-2 rounded-full text-sm font-medium bg-white text-[#5c748a] border border-[#eaedf1] hover:bg-[#f1f2f3] transition-all';
    });

    const activeButton = document.getElementById(`batch-${batch}`);
    if (activeButton) {
        activeButton.className = 'px-4 py-2 rounded-full text-sm font-medium bg-[#dce8f3] text-[#101518] border border-[#dce8f3] transition-all hover:shadow-md';
    }

    renderTeamMembers();
    renderPagination();
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function () {
    // Set up batch filter buttons
    document.getElementById('batch-all').onclick = () => handleBatchFilter('all');
    document.getElementById('batch-A').onclick = () => handleBatchFilter('QIP Alumni');
    document.getElementById('batch-AA').onclick = () => handleBatchFilter('Past Alumni');
    document.getElementById('batch-B').onclick = () => handleBatchFilter('2025 Pilot Batch');
    document.getElementById('batch-C').onclick = () => handleBatchFilter('2026 B.Tech');
    document.getElementById('batch-D').onclick = () => handleBatchFilter('2027 B.Tech');
    document.getElementById('batch-E').onclick = () => handleBatchFilter('Interns');
    

    // Initial render
    renderTeamMembers();
    renderPagination();
});
