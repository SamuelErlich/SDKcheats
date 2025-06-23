// DOM Elements
const featuredProductsContainer = document.getElementById("featuredProducts");
const allProductsContainer = document.getElementById("allProducts");
const chatWidget = document.getElementById("chatWidget");
const alertBar = document.getElementById("alertBar");

// State
let allProducts = [];
let displayedProducts = 6;

// Initialize the application
document.addEventListener("DOMContentLoaded", function() {
    loadProducts();
    initializeEventListeners();
});

// Load products (using static fallback data)
function loadProducts() {
    const featured = [
        {
            id: 1,
            name: "Rust",
            description: "Cheats para o jogo Rust - Aimbot, ESP, Wallhack e muito mais",
            price: 200,
            original_price: 350,
            discount_percentage: 43,
            game_url: "https://"
        },
        {
            id: 2,
            name: "DELTA FORCE",
            description: "Cheats para Delta Force - Recursos avançados de combate",
            price: 157,
            original_price: null,
            discount_percentage: null
        },
        {
            id: 3,
            name: "DAYZ",
            description: "Cheats para DayZ - Sobrevivência garantida no apocalipse zumbi",
            price: 199,
            original_price: 299,
            discount_percentage: 33,
            game_url: "dayz.html",
        }
    ];
    
    allProducts = [
        {
            id: 1,
            name: "Rust",
            description: "Cheats para o jogo Rust - Aimbot, ESP, Wallhack e muito mais",
            price: 200,
            original_price: 350,
            discount_percentage: 43,
            game_url: "https://elitehacks.ru/en/game/rust"
        },
        {
            id: 2,
            name: "DELTA FORCE",
            description: "Cheats para Delta Force - Recursos avançados de combate",
            price: 157,
            original_price: null,
            discount_percentage: null
        },
        {
            id: 3,
            name: "DAYZ",
            description: "Cheats para DayZ - Sobrevivência garantida no apocalipse zumbi",
            price: 199,
            original_price: 299,
            discount_percentage: 33
        },
        {
            id: 4,
            name: "Escape From Tarkov",
            description: "Cheats para EFT - Domine as raids com nossos cheats premium",
            price: 250,
            original_price: 400,
            discount_percentage: 37
        },
        {
            id: 5,
            name: "Counter-Strike 2",
            description: "Cheats para CS2 - Aimbot, Triggerbot, ESP e Anti-Aim",
            price: 180,
            original_price: 280,
            discount_percentage: 36
        },
        {
            id: 6,
            name: "Valorant",
            description: "Cheats para Valorant - Recursos indetectáveis para competitivo",
            price: 220,
            original_price: 320,
            discount_percentage: 31
        }
    ];
    
    renderFeaturedProducts(featured);
    renderAllProducts();
}

// Render featured products
function renderFeaturedProducts(products) {
    if (!featuredProductsContainer) return;
    
    featuredProductsContainer.innerHTML = products.map(product => `
        <a href="${product.game_url || '#!'}" class="product-card-link">
            <div class="product-card">
                <div class="product-image">
                    ${getProductIcon(product.name)}
                </div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description || 'Cheats premium para ' + product.name}</p>
                <div class="product-pricing">
                    <span class="product-price">R$ ${product.price}</span>
                    ${product.original_price ? `<span class="product-original-price">R$ ${product.original_price}</span>` : ''}
                    ${product.discount_percentage ? `<span class="product-discount">-${product.discount_percentage}%</span>` : ''}
                </div>
                <button class="product-buy-btn" onclick="event.preventDefault(); buyProduct(${product.id});">
                    Comprar
                </button>
            </div>
        </a>
    `).join('');
}

// Render all products
function renderAllProducts() {
    if (!allProductsContainer) return;
    
    const productsToShow = allProducts.slice(0, displayedProducts);
    
    allProductsContainer.innerHTML = productsToShow.map(product => `
        <a href="${product.game_url || '#!'}" class="product-card-link">
            <div class="product-card">
                <div class="product-image">
                    ${getProductIcon(product.name)}
                </div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description || 'Cheats premium para ' + product.name}</p>
                <div class="product-pricing">
                    <span class="product-price">R$ ${product.price}</span>
                    ${product.original_price ? `<span class="product-original-price">R$ ${product.original_price}</span>` : ''}
                    ${product.discount_percentage ? `<span class="product-discount">-${product.discount_percentage}%</span>` : ''}
                </div>
                <button class="product-buy-btn" onclick="event.preventDefault(); buyProduct(${product.id});">
                    Comprar
                </button>
            </div>
        </a>
    `).join('');
    
    // Update load more button visibility
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.style.display = displayedProducts >= allProducts.length ? 'none' : 'block';
    }
}

// Get product icon based on game name
function getProductIcon(gameName) {
    const icons = {
        'Rust': '🦀',
        'DELTA FORCE': '🎯',
        'DAYZ': '🧟',
        'Escape From Tarkov': '🔫',
        'Counter-Strike 2': '💥',
        'Valorant': '⚡'
    };
    
    return icons[gameName] || '🎮';
}

// Initialize event listeners
function initializeEventListeners() {
    // Load more products button
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreProducts);
    }
    
    // Accept cookies button
    const acceptCookiesBtn = document.querySelector('.accept-cookies');
    if (acceptCookiesBtn) {
        acceptCookiesBtn.addEventListener('click', acceptCookies);
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
}

// Load more products
function loadMoreProducts() {
    displayedProducts += 6;
    renderAllProducts();
}

// Buy product function
function buyProduct(productId) {
    // In a real application, this would redirect to a payment page
    // For now, we'll show an alert
    alert(`Redirecionando para a compra do produto ID: ${productId}\n\nEm um site real, isso levaria você para uma página de pagamento segura.`);
}

// Close alert bar
function closeAlert() {
    if (alertBar) {
        alertBar.style.animation = 'slideUp 0.5s ease-out forwards';
        setTimeout(() => {
            alertBar.style.display = 'none';
        }, 500);
    }
}

// Toggle chat widget
function toggleChat() {
    if (chatWidget) {
        const isVisible = chatWidget.style.display === 'flex';
        chatWidget.style.display = isVisible ? 'none' : 'flex';
        
        if (!isVisible) {
            // Add a welcome message if chat is empty
            const chatBody = chatWidget.querySelector('.chat-body');
            if (chatBody.children.length <= 1) {
                addChatMessage('Olá! Como posso ajudá-lo hoje? Para suporte técnico, entre em contato através do nosso Telegram: @elitesup', 'bot');
            }
        }
    }
}

// Add chat message
function addChatMessage(message, sender = 'user') {
    const chatBody = chatWidget.querySelector('.chat-body');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    messageDiv.innerHTML = `<p>${message}</p>`;
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Accept cookies
function acceptCookies() {
    const cookieNotice = document.querySelector('.cookie-notice');
    if (cookieNotice) {
        cookieNotice.style.display = 'none';
        localStorage.setItem('cookiesAccepted', 'true');
    }
}

// Check if cookies were already accepted
function checkCookiesAccepted() {
    if (localStorage.getItem('cookiesAccepted') === 'true') {
        const cookieNotice = document.querySelector('.cookie-notice');
        if (cookieNotice) {
            cookieNotice.style.display = 'none';
        }
    }
}

// Toggle mobile menu (placeholder for future implementation)
function toggleMobileMenu() {
    // This would implement mobile menu functionality
    console.log('Mobile menu toggle - to be implemented');
}

// Add slide up animation for alert bar
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            transform: translateY(0);
            opacity: 1;
        }
        to {
            transform: translateY(-100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize cookies check
document.addEventListener('DOMContentLoaded', checkCookiesAccepted);

// Add some interactive effects
document.addEventListener('DOMContentLoaded', function() {
    // Add parallax effect to hero background
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const heroBackground = document.querySelector('.hero-background');
        if (heroBackground) {
            heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
    
    // Add intersection observer for animations
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
    document.querySelectorAll('.reason-card, .product-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });
});

// Add chat input functionality
document.addEventListener('DOMContentLoaded', function() {
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
});

