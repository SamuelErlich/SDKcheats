// Product Page JavaScript

// DayZ Products Data
const dayzProducts = [
    {
        id: 1,
        name: "Authority",
        price: "A partir de R$35",
        status: "online",
        features: [
            "Stashes esp",
            "Debugcamera",
            "No grass",
            "Silent Aimbot",
            "ESP",
            "Mais"
        ]
    },
    {
        id: 2,
        name: "ANCIENT",
        price: "A partir de R$40",
        status: "online",
        features: [
            "ESP",
            "No grass",
            "Silent Aimbot",
            "Noclip",
            "Debugcamera",
            "Mais"
        
        ]
    },
    {
        id: 3,
        name: "HYPER",
        price: "A partir de R$35",
        status: "online",
        features: [
            "FOV",
            "Smooth",
            "Players, bots ESP",
            "Radar",
            "Aimbot",
            "Mais"
        ]
    },
    {
        id: 4,
        name: "PUSSYCAT",
        price: "A partir de R$40",
        status: "online",
        features: [
            "Aimbot",
            "Illumination of players and bots",
            "ESP players and bots",
            "Radar",
            "Loot ESP",
            "Mais"
        ]
    },
    {
        id: 5,
        name: "MEDUSA",
        price: "A partir de R$40",
        status: "updating",
        features: [
            "Night vision",
            "Turn off the grass",
            "ESP players",
            "ESP loot",
            "ESP containers",
            "Mais"
        ]
    },
    {
        id: 6,
        name: "BTG",
        price: "A partir de R$40",
        status: "online",
        features: [
            "Zombie ESP",
            "Animals, Loot, others",
            "Aimbot",
            "No grass",
            "Player ESP",
            "Mais"
        ]
    },
    {
        id: 7,
        name: "DULLWAVE",
        price: "A partir de R$40",
        originalPrice: "6 $",
        discount: "33%",
        status: "online",
        features: [
            "Silent aimbot",
            "Players Esp",
            "Loot Esp",
            "Containers Esp",
            "No grass",
            "Mais"
        ]
    }
];

// Initialize the page
document.addEventListener("DOMContentLoaded", function() {
    loadProducts();
    initializeEventListeners();
});

// Load and render products
function loadProducts() {
    const productsGrid = document.getElementById("productsGrid");
    if (!productsGrid) return;

    productsGrid.innerHTML = dayzProducts.map(product => `
        <div class="product-item">
            <div class="product-header">
                <h3 class="product-name">${product.name}</h3>
                <span class="product-status status-${product.status}">
                    ${getStatusText(product.status)}
                </span>
            </div>
            
            <div class="product-price">
                ${product.price}
                ${product.originalPrice ? `<span style="text-decoration: line-through; color: #666; font-size: 1rem; margin-left: 0.5rem;">${product.originalPrice}</span>` : ""}
                ${product.discount ? `<span style="background: #ff6b35; color: white; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; margin-left: 0.5rem;">-${product.discount}</span>` : ""}
            </div>
            
            <ul class="product-features">
                ${product.features.map(feature => `<li>${feature}</li>`).join("")}
            </ul>
            
            <div class="product-actions">
                <button class="btn-primary" onclick="purchaseProduct(${product.id})">
                    Comprar Agora
                </button>
                <button class="btn-secondary" onclick="viewDetails(${product.id})">
                    Detalhes
                </button>
            </div>
        </div>
    `).join("");
}

// Get status text in Portuguese
function getStatusText(status) {
    const statusMap = {
        "online": "Online",
        "updating": "Atualizando",
        "offline": "Offline"
    };
    return statusMap[status] || "Desconhecido";
}

// Purchase product function
function purchaseProduct(productId) {
    const product = dayzProducts.find(p => p.id === productId);
    if (product) {
        // Removido o alert
    }
}

// View product details
function viewDetails(productId) {
    const product = dayzProducts.find(p => p.id === productId);
    if (product) {
        if (product.name === "Authority") {
            window.location.href = "authority.html";
        } else {
            // Removido o alert
        }
    }
}

// Initialize event listeners
function initializeEventListeners() {
    // Language selector
    const langBtns = document.querySelectorAll(".lang-btn");
    langBtns.forEach(btn => {
        btn.addEventListener("click", function() {
            langBtns.forEach(b => b.classList.remove("active"));
            this.classList.add("active");
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll("a[href^=\"#\"]").forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute("href"));
            if (target) {
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });

    // Add scroll effect to header
    window.addEventListener("scroll", function() {
        const header = document.querySelector(".header");
        if (window.scrollY > 100) {
            header.style.background = "rgba(10, 10, 10, 0.98)";
        } else {
            header.style.background = "rgba(10, 10, 10, 0.95)";
        }
    });

    // Chat functionality
    const chatInput = document.querySelector(".chat-input input");
    const chatSendBtn = document.querySelector(".chat-input button");
    
    if (chatInput && chatSendBtn) {
        function sendMessage() {
            const message = chatInput.value.trim();
            if (message) {
                addChatMessage(message, "user");
                chatInput.value = "";
                
                // Simulate bot response
                setTimeout(() => {
                    addChatMessage("Obrigado pela sua mensagem sobre DayZ! Nossa equipe de suporte entrará em contato em breve. Para suporte imediato, acesse nosso Telegram: @elitesup", "bot");
                }, 1000);
            }
        }
        
        chatSendBtn.addEventListener("click", sendMessage);
        chatInput.addEventListener("keypress", function(e) {
            if (e.key === "Enter") {
                sendMessage();
            }
        });
    }
}

// Add intersection observer for animations
document.addEventListener("DOMContentLoaded", function() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    setTimeout(() => {
        document.querySelectorAll(".product-item, .feature-card").forEach(el => {
            el.style.opacity = "0";
            el.style.transform = "translateY(30px)";
            el.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
            observer.observe(el);
        });
    }, 100);
});


