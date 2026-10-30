const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const themeLabel = document.getElementById('themeLabel');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const projectSearch = document.getElementById('projectSearch');
const projectCards = [...document.querySelectorAll('.project-card')];
const filterButtons = [...document.querySelectorAll('.filter-button')];
const searchCount = document.getElementById('searchCount');
const emptyState = document.getElementById('emptyState');
let activeFilter = 'all';

function setTheme(isDark) {
  document.body.classList.toggle('dark-mode', isDark);
  themeIcon.textContent = isDark ? '☀' : '☾';
  themeLabel.textContent = isDark ? 'Light mode' : 'Dark mode';
  themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  try { localStorage.setItem('aamir-portfolio-theme', isDark ? 'dark' : 'light'); } catch (_) {}
}
try { setTheme(localStorage.getItem('aamir-portfolio-theme') === 'dark'); } catch (_) { setTheme(false); }
themeToggle.addEventListener('click', () => setTheme(!document.body.classList.contains('dark-mode')));

menuToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  menuToggle.textContent = isOpen ? '×' : '☰';
});
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navLinks.classList.remove('open'); menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.textContent = '☰';
}));

function filterProjects() {
  const query = projectSearch.value.trim().toLowerCase();
  let visible = 0;
  projectCards.forEach(card => {
    const searchable = `${card.dataset.name} ${card.dataset.tech} ${card.textContent}`.toLowerCase();
    const matchesQuery = searchable.includes(query);
    const technologies = card.dataset.tech.toLowerCase().split(/\s+/);
    const matchesFilter = activeFilter === 'all' || technologies.includes(activeFilter) || (activeFilter === 'web' && technologies.some(t => ['html','css','javascript','web'].includes(t)));
    const show = matchesQuery && matchesFilter;
    card.hidden = !show;
    if (show) visible++;
  });
  searchCount.textContent = `Showing ${visible} of ${projectCards.length} projects`;
  emptyState.hidden = visible !== 0;
}
projectSearch.addEventListener('input', filterProjects);
filterButtons.forEach(button => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  filterButtons.forEach(item => item.classList.toggle('active', item === button));
  filterProjects();
}));
filterProjects();
document.getElementById('year').textContent = new Date().getFullYear();


// City weather lookup using Open-Meteo geocoding and forecast APIs (no API key required).
const weatherForm = document.getElementById('weatherForm');
const cityInput = document.getElementById('cityInput');
const weatherButton = document.getElementById('weatherButton');
const weatherStatus = document.getElementById('weatherStatus');
const weatherResult = document.getElementById('weatherResult');

function weatherDescription(code) {
  const descriptions = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Depositing rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle',
    55: 'Dense drizzle', 56: 'Light freezing drizzle', 57: 'Dense freezing drizzle',
    61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain', 66: 'Light freezing rain',
    67: 'Heavy freezing rain', 71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
    77: 'Snow grains', 80: 'Slight rain showers', 81: 'Moderate rain showers',
    82: 'Violent rain showers', 85: 'Slight snow showers', 86: 'Heavy snow showers',
    95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail'
  };
  return descriptions[code] || 'Conditions unavailable';
}

weatherForm.addEventListener('submit', async event => {
  event.preventDefault();
  const city = cityInput.value.trim();
  if (!city) {
    weatherStatus.textContent = 'Please enter a city.';
    weatherResult.hidden = true;
    return;
  }

  weatherButton.disabled = true;
  weatherStatus.textContent = 'Loading weather…';
  weatherResult.hidden = true;

  try {
    const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    if (!geoResponse.ok) throw new Error('Could not search for that city. Please try again.');
    const geoData = await geoResponse.json();
    const place = geoData.results?.[0];
    if (!place) throw new Error('City not found. Check the spelling and try again.');

    const forecastUrl = new URL('https://api.open-meteo.com/v1/forecast');
    forecastUrl.search = new URLSearchParams({
      latitude: place.latitude,
      longitude: place.longitude,
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m',
      timezone: 'auto'
    }).toString();
    const weatherResponse = await fetch(forecastUrl);
    if (!weatherResponse.ok) throw new Error('Weather data is temporarily unavailable. Please try again.');
    const weatherData = await weatherResponse.json();
    const current = weatherData.current;
    if (!current) throw new Error('No current weather data was returned for this city.');

    const location = [place.name, place.admin1, place.country].filter(Boolean).filter((value, index, arr) => arr.indexOf(value) === index).join(', ');
    weatherResult.replaceChildren();
    const heading = document.createElement('h3');
    heading.textContent = location;
    const condition = document.createElement('p');
    condition.className = 'weather-condition';
    condition.textContent = weatherDescription(current.weather_code);
    const temperature = document.createElement('p');
    temperature.className = 'weather-temperature';
    temperature.textContent = `${Math.round(current.temperature_2m)}°C`;
    const details = document.createElement('div');
    details.className = 'weather-details';
    [
      ['Feels like', `${Math.round(current.apparent_temperature)}°C`],
      ['Humidity', `${current.relative_humidity_2m}%`],
      ['Wind', `${Math.round(current.wind_speed_10m)} km/h`]
    ].forEach(([label, value]) => {
      const item = document.createElement('div');
      const small = document.createElement('span');
      small.textContent = label;
      const strong = document.createElement('strong');
      strong.textContent = value;
      item.append(small, strong);
      details.appendChild(item);
    });
    weatherResult.append(heading, condition, temperature, details);
    weatherResult.hidden = false;
    weatherStatus.textContent = `Current conditions for ${location}.`;
  } catch (error) {
    weatherStatus.textContent = error.message || 'Unable to fetch weather. Please try again.';
  } finally {
    weatherButton.disabled = false;
  }
});

// Portfolio chatbot: the browser calls our Vercel serverless function, never the provider directly.
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');
const chatStatus = document.getElementById('chatStatus');
const sendButton = document.getElementById('sendButton');
const portfolioContext = `You are Aamir Afroz's portfolio assistant. Answer only using this information and be honest when something is unknown. Keep answers under 90 words. Aamir Afroz is a B.Tech Computer Science and Engineering student in the third semester at JECRC University in Jaipur, India. Skills listed: C, C++, MS Office, HTML, CSS, and JavaScript. GitHub: https://github.com/aamirafroz6727-prog. LinkedIn: https://www.linkedin.com/in/aamir-afroz-b18624379. Email: aamirbth85@gmail.com. Listed repositories: Python Programs Collection at https://github.com/aamirafroz6727-prog/python-factorial; a repository supplied for Messy Python Code Improvement at https://github.com/aamirafroz6727-prog/book-reading (the exact match is unverified); a repository supplied for Bug Fixing Using Cursor AI at https://github.com/aamirafroz6727-prog/Practice-laundirt (specific bug details unknown); Interactive Quiz Application at https://github.com/aamirafroz6727-prog/code-with-ai-quiz-main; Book Reading List Application at https://github.com/aamirafroz6727-prog/Python-Basic-PE (the exact match is unverified). Do not invent experience, achievements, or project details.`;
function addMessage(text, role) {
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${role === 'user' ? 'user-bubble' : 'bot-bubble'}`;
  bubble.textContent = text;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
async function sendChat(question) {
  const cleanQuestion = question.trim();
  if (!cleanQuestion || sendButton.disabled) return;
  addMessage(cleanQuestion, 'user');
  chatInput.value = '';
  sendButton.disabled = true;
  chatStatus.textContent = 'Thinking…';
  try {
    const response = await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: cleanQuestion, context: portfolioContext })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'The AI service is unavailable. Please try again.');
    addMessage(data.answer || 'I could not generate an answer. Please try again.', 'assistant');
    chatStatus.textContent = '';
  } catch (error) {
    addMessage(error.message || 'Could not reach the AI service. For local testing, run the Vercel development server and set GROQ_API_KEY in .env.local.', 'assistant');
    chatStatus.textContent = 'For local testing, check that .env.local contains GROQ_API_KEY and review the terminal for function errors.';
  } finally {
    sendButton.disabled = false;
    chatInput.focus();
  }
}
chatForm.addEventListener('submit', event => { event.preventDefault(); sendChat(chatInput.value); });
document.querySelectorAll('.prompt-chip').forEach(button => button.addEventListener('click', () => sendChat(button.textContent)));
