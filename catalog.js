// Catalog Page JavaScript

// Games data based on the original catalog
const gamesData = [
    {
        id: 1,
        name: "Rust",
        price: "From 2 $",
        originalPrice: "5 $",
        discount: "60%",
        icon: "🦀",
        link: "dayz.html" // Placeholder - will be updated when Rust page is created
    },
    {
        id: 2,
        name: "ARENA BREAKOUT: INFINITE",
        price: "From 5 $",
        icon: "🎯",
        link: "#"
    },
    {
        id: 3,
        name: "Dune: Awakening",
        price: "From 4.2 $",
        icon: "🏜️",
        link: "#"
    },
    {
        id: 4,
        name: "DELTA FORCE",
        price: "From 2 $",
        icon: "⚡",
        link: "#"
    },
    {
        id: 5,
        name: "Marvel Rivals",
        price: "From 2.4 $",
        icon: "🦸",
        link: "#"
    },
    {
        id: 6,
        name: "Escape From Tarkov",
        price: "From 2.5 $",
        icon: "🔫",
        link: "#"
    },
    {
        id: 7,
        name: "DAYZ",
        price: "From 2.5 $",
        originalPrice: "4.5 $",
        discount: "44%",
        icon: "🧟",
        link: "dayz.html"
    },
    {
        id: 8,
        name: "Fortnite",
        price: "From 2.6 $",
        icon: "🏗️",
        link: "#"
    },
    {
        id: 9,
        name: "HWID SPOOFER",
        price: "From 2 $",
        originalPrice: "4 $",
        discount: "50%",
        icon: "🛡️",
        link: "#"
    },
    {
        id: 10,
        name: "FragPunk",
        price: "From 4 $",
        icon: "💥",
        link: "#"
    },
    {
        id: 11,
        name: "STALCRAFT",
        price: "From 5 $",
        icon: "☢️",
        link: "#"
    },
    {
        id: 12,
        name: "WAR TUNDRA",
        price: "From 2.5 $",
        icon: "❄️",
        link: "#"
    },
    {
        id: 13,
        name: "Counter-Strike 2",
        price: "From 3 $",
        icon: "💥",
        link: "#"
    },
    {
        id: 14,
        name: "Valorant",
        price: "From 4 $",
        icon: "⚡",
        link: "#"
    },
    {
        id: 15,
        name: "Apex Legends",
        price: "From 3.5 $",
        icon: "🎯",
        link: "#"
    },
    {
        id: 16,
        name: "Call of Duty",
        price: "From 5 $",
        icon: "🎖️",
        link: "#"
    }
];

// State management
let displayedGames = 8;
let filteredGames = [...gamesData];
let searchTerm = '';

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    renderGames();
    initializeEventListeners();
});

// Render games grid
function renderGames() {
    const gamesGrid = document.getElementById('gamesGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    if (!gamesGrid) return;

    // Get games to display
    const gamesToShow = filteredGames.slice(0, displayedGames);
    
    // Render games
    gamesGrid.innerHTML = gamesToShow.map(game => `
        <a href="${game.link}" class="game-card">
            <div class="game-image">
                ${game.icon}
            </div>
            <div class="game-info">
                <h3 class="game-name">${game.name}</h3>
                <div class="game-price">
                    ${game.price}
                    ${game.originalPrice ? `<span class="original-price">${game.originalPrice}</span>` : ''}
                    ${game.discount ? `<span class="game-discount">-${game.discount}</span>` : ''}
                </div>
            </div>
        </a>
    `).join('');

    // Update load more button
    if (loadMoreBtn) {
        if (displayedGames >= filteredGames.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
        }
    }
}

// Search functionality
function searchGames(term) {
    searchTerm = term.toLowerCase();
    filteredGames = gamesData.filter(game => 
        game.name.toLowerCase().includes(searchTerm)
    );
    displayedGames = 8; // Reset displayed count
    renderGames();
}

// Load more games
function loadMoreGames() {
    displayedGames += 8;
    renderGames();
}

// Initialize event listeners
function initializeEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            searchGames(e.target.value);
        });
    }

    // Load more button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreGames);
    }

    // Language selector
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            langBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add scroll effect to header
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(10, 10, 10, 0.98)';
        } else {
            header.style.background = 'rgba(10, 10, 10, 0.95)';
        }
    });

    // Chat functionality
    const chatInput = document.querySelector('.chat-input input');
    const chatSendBtn = document.querySelector('.chat-input button');
    
    if (chatInput && chatSendBtn) {
        function sendMessage() {
            const message = chatInput.value.trim();
            if (message) {
                addChatMessage(message, 'user');
                chatInput.value = '';
                
                // Simulate bot response
                setTimeout(() => {
                    addChatMessage('Obrigado pela sua mensagem! Nossa equipe de suporte entrará em contato em breve. Para suporte imediato, acesse nosso Telegram: @elitesup', 'bot');
                }, 1000);
            }
        }
        
        chatSendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
}

// Mobile menu toggle
function toggleMobileMenu() {
    const nav = document.querySelector('.nav');
    if (nav) {
        nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
    }
}

// Add intersection observer for animations
document.addEventListener('DOMContentLoaded', function() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    setTimeout(() => {
        document.querySelectorAll('.game-card, .feature-item').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            observer.observe(el);
        });
    }, 100);
});

// Export functions for global access
window.toggleMobileMenu = toggleMobileMenu;

