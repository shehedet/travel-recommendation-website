// =====================================================
// WANDERLUST — travel_recommendation.js
// =====================================================

// --- Navbar scroll behavior ---
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (navbar && !navbar.classList.contains('navbar-solid')) {
    if (window.scrollY > 60) {
      navbar.style.background = 'rgba(250, 246, 238, 0.97)';
      navbar.style.borderBottomColor = '#E0D5C0';
      const logoText = navbar.querySelector('.logo-text');
      const navLinksAll = navbar.querySelectorAll('.nav-links a');
      const searchInput = navbar.querySelector('#searchInput');
      if (logoText) logoText.style.color = '#1A1208';
      navLinksAll.forEach(a => {
        if (!a.classList.contains('active')) a.style.color = '#1A1208';
      });
      if (searchInput) {
        searchInput.style.background = 'rgba(26,18,8,0.05)';
        searchInput.style.borderColor = '#E0D5C0';
        searchInput.style.color = '#1A1208';
      }
      const resetBtn = document.getElementById('resetBtn');
      if (resetBtn) {
        resetBtn.style.background = 'rgba(26,18,8,0.06)';
        resetBtn.style.color = '#1A1208';
        resetBtn.style.borderColor = '#E0D5C0';
      }
    } else {
      navbar.style.background = 'rgba(250, 246, 238, 0.12)';
      navbar.style.borderBottomColor = 'rgba(255,255,255,0.15)';
      const logoText = navbar.querySelector('.logo-text');
      const navLinksAll = navbar.querySelectorAll('.nav-links a');
      const searchInput = navbar.querySelector('#searchInput');
      if (logoText) logoText.style.color = '#FFFFFF';
      navLinksAll.forEach(a => {
        if (!a.classList.contains('active')) a.style.color = '#FFFFFF';
      });
      if (searchInput) {
        searchInput.style.background = 'rgba(255,255,255,0.15)';
        searchInput.style.borderColor = 'rgba(255,255,255,0.3)';
        searchInput.style.color = '#FFFFFF';
      }
      const resetBtn = document.getElementById('resetBtn');
      if (resetBtn) {
        resetBtn.style.background = 'rgba(255,255,255,0.2)';
        resetBtn.style.color = '#FFFFFF';
        resetBtn.style.borderColor = 'rgba(255,255,255,0.35)';
      }
    }
  }
});

// --- Mobile nav toggle ---
function toggleMenu() {
  const navLinks = document.querySelector('.nav-links');
  if (navLinks) navLinks.classList.toggle('open');
}

// =====================================================
// SEARCH FUNCTIONALITY
// =====================================================

// Allow pressing Enter in the search input
const searchInput = document.getElementById('searchInput');
if (searchInput) {
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') search();
  });
}

// Main search function — triggered by Search button
function search() {
  const input = searchInput ? searchInput.value.trim() : '';
  if (!input) {
    alert('Please enter a keyword to search (e.g. beach, temple, or a country name).');
    return;
  }
  performSearch(input);
}

// Accepts a keyword string and fetches + displays results
function performSearch(keyword) {
  const normalized = keyword.toLowerCase().trim();

  fetch('travel_recommendation_api.json')
    .then(response => {
      if (!response.ok) throw new Error('Network error: ' + response.status);
      return response.json();
    })
    .then(data => {
      console.log('API data loaded:', data);
      const results = matchKeyword(normalized, data);
      displayResults(results, keyword);
    })
    .catch(err => {
      console.error('Error fetching travel data:', err);
      alert('Could not load travel data. Please ensure travel_recommendation_api.json is accessible.');
    });
}

// Match keyword to appropriate data category
function matchKeyword(keyword, data) {
  // Beach keywords
  if (
    keyword === 'beach' ||
    keyword === 'beaches' ||
    keyword.includes('beach')
  ) {
    return { type: 'Beaches', items: data.beaches };
  }

  // Temple keywords
  if (
    keyword === 'temple' ||
    keyword === 'temples' ||
    keyword.includes('temple')
  ) {
    return { type: 'Temples', items: data.temples };
  }

  // Country / city keywords
  if (
    keyword === 'country' ||
    keyword === 'countries' ||
    keyword === 'city' ||
    keyword === 'cities' ||
    keyword.includes('country') ||
    keyword.includes('australia') ||
    keyword.includes('japan') ||
    keyword.includes('brazil') ||
    keyword.includes('tokyo') ||
    keyword.includes('sydney') ||
    keyword.includes('rio')
  ) {
    // Filter by specific country if mentioned
    let filtered = data.countries;
    if (keyword !== 'country' && keyword !== 'countries' && keyword !== 'city' && keyword !== 'cities') {
      filtered = data.countries.filter(c =>
        c.country.toLowerCase().includes(keyword) ||
        c.name.toLowerCase().includes(keyword)
      );
      if (filtered.length === 0) filtered = data.countries; // fallback to all
    }
    return { type: 'Countries', items: filtered };
  }

  // Generic text search across all items
  const allItems = [
    ...data.beaches.map(i => ({ ...i, _type: 'Beach' })),
    ...data.temples.map(i => ({ ...i, _type: 'Temple' })),
    ...data.countries.map(i => ({ ...i, _type: 'Country' }))
  ];

  const matched = allItems.filter(item =>
    item.name.toLowerCase().includes(keyword) ||
    item.country.toLowerCase().includes(keyword) ||
    item.description.toLowerCase().includes(keyword)
  );

  return { type: `Results for "${keyword}"`, items: matched };
}

// =====================================================
// DISPLAY RESULTS
// =====================================================

function displayResults(results, searchKeyword) {
  const section = document.getElementById('results');
  const grid = document.getElementById('resultsGrid');
  const title = document.getElementById('resultsTitle');
  const subtitle = document.getElementById('resultsSubtitle');

  if (!section || !grid) {
    // If we're not on the home page, redirect
    window.location.href = 'index.html';
    return;
  }

  if (!results.items || results.items.length === 0) {
    section.style.display = 'block';
    title.textContent = 'No Results Found';
    subtitle.textContent = `We couldn't find anything for "${searchKeyword}". Try: beach, temple, or a country name.`;
    grid.innerHTML = '<p style="color:var(--muted); text-align:center; grid-column:1/-1;">Try searching for beaches, temples, or countries like Japan or Australia.</p>';
    section.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  title.textContent = results.type;
  subtitle.textContent = `${results.items.length} curated recommendation${results.items.length !== 1 ? 's' : ''} for you`;

  grid.innerHTML = '';
  results.items.forEach((item, index) => {
    const card = createResultCard(item, index);
    grid.appendChild(card);
  });

  section.style.display = 'block';
  section.scrollIntoView({ behavior: 'smooth' });
}

function createResultCard(item, index) {
  const card = document.createElement('div');
  card.className = 'result-card';
  card.style.animationDelay = `${index * 0.08}s`;

  // Get local time if timezone available
  let timeHTML = '';
  if (item.timeZone) {
    const localTime = getLocalTime(item.timeZone);
    timeHTML = `<span class="result-card-time">🕐 Local time: ${localTime}</span>`;
  }

  card.innerHTML = `
    <img
      src="${item.imageUrl}"
      alt="${item.name}"
      onerror="this.src='https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80'"
    />
    <div class="result-card-body">
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      ${timeHTML}
    </div>
  `;

  return card;
}

// =====================================================
// CLEAR / RESET
// =====================================================

function clearResults() {
  const section = document.getElementById('results');
  const grid = document.getElementById('resultsGrid');
  const searchInput = document.getElementById('searchInput');

  if (grid) grid.innerHTML = '';
  if (section) section.style.display = 'none';
  if (searchInput) searchInput.value = '';
}

// =====================================================
// LOCAL TIME HELPER (Task 10)
// =====================================================

function getLocalTime(timeZone) {
  try {
    const options = {
      timeZone: timeZone,
      hour12: true,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    };
    return new Date().toLocaleTimeString('en-US', options);
  } catch (e) {
    return 'N/A';
  }
}

// =====================================================
// CONTACT FORM HANDLER
// =====================================================

function handleSubmit(e) {
  e.preventDefault();
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('successMsg');

  if (form) form.style.display = 'none';
  if (successMsg) successMsg.style.display = 'flex';

  // Optional: scroll to success
  if (successMsg) successMsg.scrollIntoView({ behavior: 'smooth' });
}
