const SECRET_KEY = "Secjgd123#$13";
let rawData = [];
let fuse;

const PROGRAMS = [
    {
        name: "Happiness Program",
        cat: "Introductory",
        desc: "The flagship course featuring Sudarshan Kriya™.",
        content: `<h3>Sudarshan Kriya: The Science of Breath</h3>
                  <p>A powerful rhythmic breathing technique that harmonizes the body, mind, and emotions. Research shows it significantly reduces cortisol (stress hormone) and enhances brain function.</p>
                  <ul>
                    <li><strong>Research:</strong> Published studies in the <i>Journal of Affective Disorders</i> show up to 70% success in reducing anxiety and depression.</li>
                    <li><strong>Testimonial:</strong> "It changed my perspective on life completely. I feel more energetic and focused." - Ravi, Tech Lead.</li>
                  </ul>`,
        icon: "bi-emoji-smile"
    },
    {
        name: "Sahaj Samadhi Dhyan Yoga",
        cat: "Meditation",
        desc: "Learn effortless mantra-based meditation.",
        content: `<h3>Effortless Silence</h3>
                  <p>Sahaj means natural, and Samadhi is a state of deep rest. This technique allows the mind to settle effortlessly into a state of profound peace.</p>
                  <ul>
                    <li><strong>Benefits:</strong> Lower blood pressure, improved sleep quality, and increased mental clarity.</li>
                    <li><strong>How it works:</strong> You are given a personal mantra that acts as a vehicle to take the mind to its quietest state.</li>
                  </ul>`,
        icon: "bi-moon-stars"
    },
    {
        name: "Advanced Meditation Program",
        cat: "Deep Dive into Silence",
        desc: "Cut the external noise and take a deep rest through guided meditations & silence.",
        content: `<h3>The Power of Silence</h3>
                  <p>A residential or non-residential retreat designed to take you deeper into your spiritual practice using silence as a tool for rejuvenation.</p>
                  <ul>
                    <li><strong>What to expect:</strong> Unique hollow-and-empty meditations and deep contemplation sessions.</li>
                    <li><strong>Requirement:</strong> Completion of the Happiness Program.</li>
                  </ul>`,
        icon: "bi-headphones"
    },
    {
        name: "DSN",
        cat: "Leadership",
        desc: "Break free from personal inhibitions.",
        content: `<h3>Dynamism, Self-confidence, and Newness</h3>
                  <p>A rigorous program that identifies and shatters the mental barriers that prevent you from reaching your full potential.</p>
                  <p>Ideal for those looking to take on leadership roles or overcome stage fear and social anxiety.</p>`,
        icon: "bi-lightning-charge"
    },
    {
        name: "VTP",
        cat: "Seva",
        desc: "Empowering you to serve society.",
        content: `<h3>Volunteer Training Program</h3>
                  <p>Learn the skills required to organize programs, lead groups, and become a pillar of the community. Focuses on communication and organizational excellence.</p>`,
        icon: "bi-people"
    },
    {
        name: "Intuition Process",
        cat: "Kids & Teens",
        desc: "Unlock the genius within your child.",
        content: `<h3>Unlocking Potential</h3>
                  <p>A program for children (5-18 years) that awakens the dormant faculties of the mind, enabling them to perceive things beyond their five senses.</p>
                  <ul>
                    <li><strong>Results:</strong> Improved memory, better academic performance, and enhanced creativity.</li>
                  </ul>`,
        icon: "bi-eye"
    }
];

const COURSE_MAP = {
    "Happiness Program": ["Happiness Program"],
    "Sahaj Samadhi": ["Sahaj Samadhi"],
    "AMP": ["AMP"],
    "VTP": ["VTP"],
    "DSN": ["DSN"],
    "IP": ["IP"]
};

let currentPage = 1;
let pageSize = 5;
let filteredResults = []; // Store sorted results for pagination

function changePageSize(value) {
    pageSize = parseInt(value);
    currentPage = 1; // Reset to first page
    renderResults();
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderResults();
        window.scrollTo(0, 0); // Scroll to top for better UX
    }
}

function nextPage() {
    const maxPage = Math.ceil(filteredResults.length / pageSize);
    if (currentPage < maxPage) {
        currentPage++;
        renderResults();
        window.scrollTo(0, 0);
    }
}

async function init() {
    // Encrypted data loading logic (same as your previous project)
    try {
        const response = await fetch('data.enc');
        const encrypted = await response.text();
        const decrypted = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
        rawData = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));

        fuse = new Fuse(rawData, {
            keys: ['Address'],
            threshold: 0.3,
            location: 0,
            distance: 100,
            ignoreLocation: true,
            minMatchCharLength: 3
        });

        // Populate Course Dropdown
        const select = $('#courseFilter');
        select.empty();
        Object.keys(COURSE_MAP).forEach(cat => {
            select.append(`<option value="${cat}">${cat}</option>`);
        });
        select.selectpicker('refresh');
        renderLanding();
    } catch (e) { console.error("Data Load Error", e); }
}

function cleanTeacherNames(names) {
    return names ? names.replace(/\s*\([^)]*\)/g, "") : "";
}

function formatUrl(url) {
    if (!url) return "#";
    const trimmed = url.trim();
    return (trimmed.startsWith('http')) ? trimmed : `https://${trimmed}`;
}

function renderLanding() {
    const container = document.getElementById('landing-view');
    container.innerHTML = PROGRAMS.map((p, idx) => `
        <div class="col-md-4 mb-4">
            <div class="card h-100 program-card p-4" onclick="openProgramDetails(${idx})">
                <span class="card-category mb-2">${p.cat}</span>
                <i class="bi ${p.icon} mb-3" style="font-size: 2.5rem; color: #ff7f00;"></i>
                <h4 class="font-weight-bold">${p.name}</h4>
                <p class="text-muted small">${p.desc}</p>
                <div class="text-primary font-weight-bold mt-auto">Learn More &rarr;</div>
            </div>
        </div>
    `).join('');
}

function handleSearchTrigger() {
    const query = document.getElementById('mainSearch').value.trim();
    const mode = document.querySelector('input[name="searchMode"]:checked').value;
    const selectedCourses = $('#courseFilter').val(); // Array of selected values

    const landing = document.getElementById('landing-view');
    const searchView = document.getElementById('search-view');

    // Logic: Mandate 6 digits for Pincode, 3 letters for Address
    let isValid = false;
    if (mode === 'pincode' && query.length === 6) isValid = true;
    if (mode === 'address' && query.length >= 3) isValid = true;

    if (!isValid && selectedCourses.length === 0) {
        landing.style.display = 'flex';
        searchView.style.display = 'none';
        return;
    }

    landing.style.display = 'none';
    searchView.style.display = 'block';

    performSearch(query, mode, selectedCourses);
}

function performSearch(query, mode, selectedCategories) {
    let results = rawData;

    // 1. Apply Search Mode
    if (query.length > 0) {
        if (mode === 'pincode') {
            // EXACT MATCH for Pincode
            results = results.filter(item => item['Postal Code'] === query);
        } else {
            // FUZZY MATCH for Address/Area
            const fuseResults = fuse.search(query);
            results = fuseResults.map(r => r.item);
        }
    }

    if (selectedCategories && selectedCategories.length > 0) {
        results = results.filter(item => {
            const courseName = item['Course Type'].toUpperCase();
            return selectedCategories.some(cat => {
                const keyword = COURSE_MAP[cat][0].toUpperCase();
                return courseName.includes(keyword);
            });
        });
    }

    results.sort((a, b) => {
        const parseDate = (str) => {
            if (!str) return new Date(8640000000000000); // Push empty dates to the bottom
            return new Date(str.trim());
        };
        
        const dateA = parseDate(a['Start Date']);
        const dateB = parseDate(b['Start Date']);
        
        return dateA - dateB;
    });
    filteredResults = results;
    currentPage = 1;
    renderResults();
}

function renderResults() {
    const results = filteredResults;
    const tbody = document.getElementById('search-results-body');
    const resultCountEl = document.getElementById('result-count');
    
    // Calculate Pagination Slices
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = results.slice(startIndex, endIndex);
    const maxPage = Math.ceil(results.length / pageSize) || 1;

    // Update UI Elements
    resultCountEl.innerText = `${results.length} Programs Found`;
    document.getElementById('pageInfo').innerText = `Page ${currentPage} of ${maxPage}`;
    document.getElementById('prevPage').disabled = (currentPage === 1);
    document.getElementById('nextPage').disabled = (currentPage === maxPage);
    
    tbody.innerHTML = paginatedItems.map(r => {
        const dateParts = r['Start Date'].split(' ');
        return `
            <tr>
                <td class="align-middle text-center" style="width: 80px;">
                    <div class="calendar-icon shadow-sm border rounded bg-white">
                        <div class="bg-primary text-white small font-weight-bold py-1 px-2 rounded-top">
                            ${dateParts[1].toUpperCase()}
                        </div>
                        <div class="py-1 font-weight-bold" style="font-size: 1.2rem;">
                            ${dateParts[0]}
                        </div>
                    </div>
                </td>
                <td class="align-middle"><small class="text-muted">${r['Weekday Timings']}</small></td>
                <td class="align-middle"><strong>${r['Course Type']}</strong></td>
                <td class="align-middle"><small class="text-muted">${r['Address']}</small></td>
                <td class="align-middle">${cleanTeacherNames(r['Teachers'])}</td>
                <td class="align-middle text-right">
                    <div class="d-flex justify-content-end">
                        <a href="tel:${r['Phone']}" class="text-primary mx-2"><i class="bi bi-telephone-fill"></i></a>
                        <a href="https://wa.me/91${r['Phone']}" target="_blank" class="text-success mx-2"><i class="bi bi-whatsapp"></i></a>
                        <a href="${formatUrl(r['Registration Url'])}" target="_blank" class="btn btn-sm btn-primary rounded-pill px-3">Register</a>
                    </div>
                </td>
            </tr>`;
    }).join('');
}

function openProgramDetails(idx) {
    const p = PROGRAMS[idx];
    const modalBody = document.getElementById('modal-content-body');
    modalBody.innerHTML = `
        <div class="modal-header">
            <h3 class="font-weight-bold">${p.name}</h3>
            <button type="button" class="close" data-dismiss="modal">&times;</button>
        </div>
        <div class="modal-body">${p.content}</div>
        <div class="modal-footer">
            <button class="btn btn-primary rounded-pill px-4" data-dismiss="modal">I'm Interested</button>
        </div>
    `;
    $('#programModal').modal('show');
}

function clearSearch() {
    const mode = document.querySelector('input[name="searchMode"]:checked').value;
    const hint = document.getElementById('searchHint');
    const input = document.getElementById('mainSearch');
    
    input.value = '';
    $('#courseFilter').selectpicker('deselectAll');
    $('#courseFilter').selectpicker('refresh');

    if (mode === 'pincode') {
        input.placeholder = "Enter 6-digit Pincode (e.g. 560067)";
    } else {
        input.placeholder = "Type Area or Address (e.g. BTM)";
    }
    handleSearchTrigger();
}

document.addEventListener('DOMContentLoaded', init);