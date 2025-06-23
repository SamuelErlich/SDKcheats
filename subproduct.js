// Subproduct Page JavaScript

// DOM Elements
const durationOptions = document.querySelectorAll('.duration-option');
const totalAmount = document.querySelector('.total-price .amount');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');
const thumbnails = document.querySelectorAll('.thumbnail');
const mainImage = document.querySelector('.main-image');

// Duration Selection
durationOptions.forEach(option => {
    option.addEventListener('click', () => {
        // Remove active class from all options
        durationOptions.forEach(opt => opt.classList.remove('active'));
        
        // Add active class to clicked option
        option.classList.add('active');
        
        // Update total price
        const price = option.dataset.price;
        totalAmount.textContent = `R$ ${price}`;
    });
});

// Tab Switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        
        // Remove active class from all tabs and panels
        tabBtns.forEach(tab => tab.classList.remove('active'));
        tabPanels.forEach(panel => panel.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding panel
        btn.classList.add('active');
        document.getElementById(targetTab).classList.add('active');
    });
});

// Media Gallery
thumbnails.forEach(thumbnail => {
    thumbnail.addEventListener('click', () => {
        // Remove active class from all thumbnails
        thumbnails.forEach(thumb => thumb.classList.remove('active'));
        
        // Add active class to clicked thumbnail
        thumbnail.classList.add('active');
        
        // Update main image
        const newSrc = thumbnail.querySelector('img').src;
        mainImage.src = newSrc;
    });
});

// Video Play Function
function playVideo() {
    // This would typically open a video modal or redirect to video
    alert('Funcionalidade de vídeo será implementada em breve!');
}

// Buy Button
document.querySelector('.buy-btn').addEventListener('click', () => {
    const selectedDuration = document.querySelector('.duration-option.active');
    const duration = selectedDuration.querySelector('.duration').textContent;
    const price = selectedDuration.dataset.price;
    
    // Check if terms are accepted
    const termsCheckbox = document.querySelector('input[type="checkbox"]:first-of-type');
    const dataCheckbox = document.querySelector('input[type="checkbox"]:last-of-type');
    
    if (!termsCheckbox.checked || !dataCheckbox.checked) {
        alert('Por favor, aceite os termos de uso e o processamento de dados pessoais.');
        return;
    }
    
    // Simulate purchase process
    alert(`Redirecionando para pagamento:\nProduto: Authority Cheat para DayZ\nDuração: ${duration}\nPreço: R$ ${price}`);
});

// Chat Widget Functions (inherited from main site)
function toggleChat() {
    const chatWidget = document.getElementById('chatWidget');
    const chatToggle = document.querySelector('.chat-toggle');
    
    if (chatWidget.style.display === 'none' || chatWidget.style.display === '') {
        chatWidget.style.display = 'flex';
        chatToggle.style.display = 'none';
    } else {
        chatWidget.style.display = 'none';
        chatToggle.style.display = 'flex';
    }
}

function sendMessage() {
    const input = document.querySelector('.chat-input input');
    const message = input.value.trim();
    
    if (message) {
        const chatBody = document.querySelector('.chat-body');
        
        // Add user message
        const userMessage = document.createElement('div');
        userMessage.className = 'chat-message user';
        userMessage.textContent = message;
        chatBody.appendChild(userMessage);
        
        // Clear input
        input.value = '';
        
        // Simulate bot response
        setTimeout(() => {
            const botMessage = document.createElement('div');
            botMessage.className = 'chat-message bot';
            botMessage.textContent = 'Obrigado pela sua mensagem! Nossa equipe entrará em contato em breve.';
            chatBody.appendChild(botMessage);
            
            // Scroll to bottom
            chatBody.scrollTop = chatBody.scrollHeight;
        }, 1000);
        
        // Scroll to bottom
        chatBody.scrollTop = chatBody.scrollHeight;
    }
}

// Mobile Menu Toggle (inherited from main site)
function toggleMobileMenu() {
    const nav = document.querySelector('.nav');
    nav.classList.toggle('mobile-open');
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Set initial chat widget state
    document.getElementById('chatWidget').style.display = 'none';
    
    // Add enter key support for chat
    document.querySelector('.chat-input input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add loading animation for images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', () => {
            img.style.opacity = '1';
        });
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
    });
});

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for scroll animations
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.product-card, .feature-category, .review-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

