// Variáveis globais
let selectedPaymentMethod = null;
let basePrice = 15.00;
let currentFee = 0;
let quantity = 1;
let promoDiscount = 0;

// Elementos DOM
const subscriptionSelect = document.getElementById("subscription-time");
const paymentButtons = document.querySelectorAll(".payment-btn");
const emailInput = document.getElementById("email");
const emailRepeatInput = document.getElementById("email-repeat");
const promoCodeInput = document.getElementById("promo-code");
const applyPromoBtn = document.getElementById("apply-promo");
const quantityInput = document.getElementById("quantity");
const acceptTermsCheckbox = document.getElementById("accept-terms");
const acceptPrivacyCheckbox = document.getElementById("accept-privacy");
const continueBtn = document.getElementById("continue-payment");

// Elementos de preço
const basePriceElement = document.getElementById("base-price");
const commissionElement = document.getElementById("commission");
const totalPriceElement = document.getElementById("total-price");

// Inicialização
document.addEventListener("DOMContentLoaded", function() {
    initializeEventListeners();
    updatePricing();
    validateForm();
});

function initializeEventListeners() {
    // Seleção de tempo de assinatura
    subscriptionSelect.addEventListener("change", function() {
        basePrice = parseFloat(this.selectedOptions[0].dataset.price);
        updatePricing();
    });

    // Seleção de método de pagamento
    paymentButtons.forEach(button => {
        button.addEventListener("click", function() {
            selectPaymentMethod(this);
        });
    });

    // Validação de email
    emailInput.addEventListener("input", validateForm);
    emailRepeatInput.addEventListener("input", validateForm);

    // Código promocional
    applyPromoBtn.addEventListener("click", applyPromoCode);
    promoCodeInput.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            applyPromoCode();
        }
    });

    // Quantidade
    quantityInput.addEventListener("input", function() {
        quantity = parseInt(this.value) || 1;
        updatePricing();
    });

    // Checkboxes de termos
    acceptTermsCheckbox.addEventListener("change", validateForm);
    acceptPrivacyCheckbox.addEventListener("change", validateForm);

    // Botão continuar
    continueBtn.addEventListener("click", processPayment);
}

function selectPaymentMethod(button) {
    // Remove seleção anterior
    paymentButtons.forEach(btn => btn.classList.remove("selected"));
    
    // Adiciona seleção atual
    button.classList.add("selected");
    
    // Atualiza método selecionado e taxa
    selectedPaymentMethod = button.dataset.method;
    currentFee = parseFloat(button.dataset.fee);
    
    updatePricing();
    validateForm();
}

function updatePricing() {
    const subtotal = basePrice * quantity;
    const commission = (subtotal * currentFee) / 100;
    const discount = (subtotal * promoDiscount) / 100;
    const total = subtotal + commission - discount;

    basePriceElement.textContent = `R$ ${subtotal.toFixed(2).replace(".", ",")}`;
    commissionElement.textContent = `R$ ${commission.toFixed(2).replace(".", ",")}`;
    totalPriceElement.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;
}

function applyPromoCode() {
    const promoCode = promoCodeInput.value.trim().toUpperCase();
    
    // Códigos promocionais de exemplo
    const promoCodes = {
        "DESCONTO10": 10,
        "PROMO15": 15,
        "WELCOME20": 20
    };

    if (promoCodes[promoCode]) {
        promoDiscount = promoCodes[promoCode];
        showNotification(`Código promocional aplicado! Desconto de ${promoDiscount}%`, "success");
        applyPromoBtn.textContent = "Aplicado";
        applyPromoBtn.disabled = true;
        promoCodeInput.disabled = true;
        updatePricing();
    } else if (promoCode) {
        showNotification("Código promocional inválido", "error");
    }
}

function validateForm() {
    const email = emailInput.value.trim();
    const emailRepeat = emailRepeatInput.value.trim();
    const termsAccepted = acceptTermsCheckbox.checked;
    const privacyAccepted = acceptPrivacyCheckbox.checked;

    let isValid = true;

    // Validar email
    if (!email || !isValidEmail(email)) {
        isValid = false;
    }

    // Validar repetição de email
    if (!emailRepeat || email !== emailRepeat) {
        isValid = false;
    }

    // Validar método de pagamento
    if (!selectedPaymentMethod) {
        isValid = false;
    }

    // Validar termos
    if (!termsAccepted || !privacyAccepted) {
        isValid = false;
    }

    continueBtn.disabled = !isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^
@]+@[^
@]+\.[^
@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type = "info") {
    // Criar elemento de notificação
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Estilos da notificação
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === "success" ? "#4CAF50" : type === "error" ? "#f44336" : "#2196F3"};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.animation = "slideOut 0.3s ease";
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

async function processPayment() {
    if (continueBtn.disabled) return;

    // Mostrar loading
    continueBtn.textContent = "Processando...";
    continueBtn.disabled = true;

    try {
        const productName = document.getElementById("product-name").textContent;
        const subscriptionTime = subscriptionSelect.value;
        const phoneNumber = "5511999999999"; // Substitua pelo seu número de telefone
        const message = `Olá! Tenho interesse em adquirir o produto ${productName} com assinatura de ${subscriptionTime}.`;
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, "_blank");

        showNotification("Redirecionando para o WhatsApp...", "info");

    } catch (error) {
        console.error("Erro ao redirecionar para o WhatsApp:", error);
        showNotification("Erro ao redirecionar para o WhatsApp", "error");
    } finally {
        continueBtn.textContent = "Continuar";
        continueBtn.disabled = false;
    }
}

function calculateTotal() {
    const subtotal = basePrice * quantity;
    const commission = (subtotal * currentFee) / 100;
    const discount = (subtotal * promoDiscount) / 100;
    return subtotal + commission - discount;
}


