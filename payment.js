// Variáveis globais
let selectedPaymentMethod = null;
let basePrice = 15.00;
let currentFee = 0;
let quantity = 1;
let promoDiscount = 0;

// Elementos DOM
const subscriptionSelect = document.getElementById('subscription-time');
const paymentButtons = document.querySelectorAll('.payment-btn');
const emailInput = document.getElementById('email');
const emailRepeatInput = document.getElementById('email-repeat');
const promoCodeInput = document.getElementById('promo-code');
const applyPromoBtn = document.getElementById('apply-promo');
const quantityInput = document.getElementById('quantity');
const acceptTermsCheckbox = document.getElementById('accept-terms');
const acceptPrivacyCheckbox = document.getElementById('accept-privacy');
const continueBtn = document.getElementById('continue-payment');

// Elementos de preço
const basePriceElement = document.getElementById('base-price');
const commissionElement = document.getElementById('commission');
const totalPriceElement = document.getElementById('total-price');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updatePricing();
    validateForm();
});

function initializeEventListeners() {
    // Seleção de tempo de assinatura
    subscriptionSelect.addEventListener('change', function() {
        basePrice = parseFloat(this.selectedOptions[0].dataset.price);
        updatePricing();
    });

    // Seleção de método de pagamento
    paymentButtons.forEach(button => {
        button.addEventListener('click', function() {
            selectPaymentMethod(this);
        });
    });

    // Validação de email
    emailInput.addEventListener('input', validateForm);
    emailRepeatInput.addEventListener('input', validateForm);

    // Código promocional
    applyPromoBtn.addEventListener('click', applyPromoCode);
    promoCodeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            applyPromoCode();
        }
    });

    // Quantidade
    quantityInput.addEventListener('input', function() {
        quantity = parseInt(this.value) || 1;
        updatePricing();
    });

    // Checkboxes de termos
    acceptTermsCheckbox.addEventListener('change', validateForm);
    acceptPrivacyCheckbox.addEventListener('change', validateForm);

    // Botão continuar
    continueBtn.addEventListener('click', processPayment);
}

function selectPaymentMethod(button) {
    // Remove seleção anterior
    paymentButtons.forEach(btn => btn.classList.remove('selected'));
    
    // Adiciona seleção atual
    button.classList.add('selected');
    
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

    basePriceElement.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    commissionElement.textContent = `R$ ${commission.toFixed(2).replace('.', ',')}`;
    totalPriceElement.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

function applyPromoCode() {
    const promoCode = promoCodeInput.value.trim().toUpperCase();
    
    // Códigos promocionais de exemplo
    const promoCodes = {
        'DESCONTO10': 10,
        'PROMO15': 15,
        'WELCOME20': 20
    };

    if (promoCodes[promoCode]) {
        promoDiscount = promoCodes[promoCode];
        showNotification(`Código promocional aplicado! Desconto de ${promoDiscount}%`, 'success');
        applyPromoBtn.textContent = 'Aplicado';
        applyPromoBtn.disabled = true;
        promoCodeInput.disabled = true;
        updatePricing();
    } else if (promoCode) {
        showNotification('Código promocional inválido', 'error');
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Estilos da notificação
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
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
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

async function processPayment() {
    if (continueBtn.disabled) return;

    // Mostrar loading
    continueBtn.textContent = 'Processando...';
    continueBtn.disabled = true;

    try {
        const paymentData = {
            method: selectedPaymentMethod,
            email: emailInput.value.trim(),
            product: document.getElementById('product-name').textContent,
            subscription_time: subscriptionSelect.value,
            quantity: quantity,
            base_price: basePrice,
            fee: currentFee,
            promo_discount: promoDiscount,
            total: calculateTotal()
        };

        let response;

        switch (selectedPaymentMethod) {
            case 'pix':
                response = await processPixPayment(paymentData);
                break;
            case 'card':
                response = await processCardPayment(paymentData);
                break;
            case 'crypto':
                response = await processCryptoPayment(paymentData);
                break;
            default:
                throw new Error('Método de pagamento não selecionado');
        }

        if (response.success) {
            showPaymentSuccess(response);
        } else {
            throw new Error(response.message || 'Erro no processamento do pagamento');
        }

    } catch (error) {
        console.error("Erro no pagamento:", error);
        showNotification(error.message || "Erro no processamento do pagamento", "error");
    } finally {
        continueBtn.textContent = "Continuar";
        continueBtn.disabled = false;
    }
}

async function processPixPayment(paymentData) {
    try {
        const response = await fetch('https://sdkcheats-payment-backend.onrender.com/api/payment/pix', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentData)
        });

        const data = await response.json();
        
        if (data.success) {
            // Mostrar QR Code do PIX
            showPixQRCode(data.qr_code, data.qr_code_base64);
            return { success: true, data };
        } else {
            throw new Error(data.message || 'Erro ao gerar PIX');
        }
    } catch (error) {
        throw new Error('Erro na comunicação com o servidor PIX');
    }
}

async function processCardPayment(paymentData) {
    try {
        // Redirecionar para página de cartão com os dados
        const queryParams = new URLSearchParams({
            data: JSON.stringify(paymentData)
        });
        
        window.location.href = `/card-payment.html?${queryParams.toString()}`;
        return { success: true };
    } catch (error) {
        throw new Error('Erro ao processar pagamento com cartão');
    }
}

async function processCryptoPayment(paymentData) {
    try {
        // Redirecionar para página de criptomoedas com os dados
        const queryParams = new URLSearchParams({
            data: JSON.stringify(paymentData)
        });
        
        window.location.href = `/crypto-payment.html?${queryParams.toString()}`;
        return { success: true };
    } catch (error) {
        throw new Error('Erro ao processar pagamento com criptomoedas');
    }
}
        } else {
            throw new Error(data.message || 'Erro ao gerar pagamento cripto');
        }
    } catch (error) {
        throw new Error('Erro na comunicação com o servidor cripto');
    }
}

function calculateTotal() {
    const subtotal = basePrice * quantity;
    const commission = (subtotal * currentFee) / 100;
    const discount = (subtotal * promoDiscount) / 100;
    return subtotal + commission - discount;
}

function showPixQRCode(qrCode, qrCodeBase64) {
    // Criar modal para mostrar QR Code
    const modal = document.createElement('div');
    modal.className = 'payment-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Pagamento via PIX</h3>
            <div class="qr-code-container">
                <img src="${qrCodeBase64}" alt="QR Code PIX" />
            </div>
            <div class="pix-code">
                <label>Código PIX:</label>
                <textarea readonly>${qrCode}</textarea>
                <button onclick="copyPixCode('${qrCode}')">Copiar Código</button>
            </div>
            <p>Escaneie o QR Code ou copie o código PIX para realizar o pagamento</p>
            <button onclick="closeModal()">Fechar</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function showCryptoPayment(walletAddress, amount, currency) {
    // Criar modal para mostrar endereço da carteira
    const modal = document.createElement('div');
    modal.className = 'payment-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Pagamento via ${currency}</h3>
            <div class="crypto-info">
                <label>Endereço da carteira:</label>
                <textarea readonly>${walletAddress}</textarea>
                <button onclick="copyWalletAddress('${walletAddress}')">Copiar Endereço</button>
            </div>
            <div class="crypto-amount">
                <label>Valor a enviar:</label>
                <strong>${amount} ${currency}</strong>
            </div>
            <p>Envie exatamente o valor especificado para o endereço acima</p>
            <button onclick="closeModal()">Fechar</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function copyPixCode(code) {
    navigator.clipboard.writeText(code).then(() => {
        showNotification('Código PIX copiado!', 'success');
    });
}

function copyWalletAddress(address) {
    navigator.clipboard.writeText(address).then(() => {
        showNotification('Endereço copiado!', 'success');
    });
}

function closeModal() {
    const modal = document.querySelector('.payment-modal');
    if (modal) {
        document.body.removeChild(modal);
    }
}

function showPaymentSuccess(response) {
    showNotification('Pagamento processado com sucesso!', 'success');
    // Aqui você pode redirecionar para uma página de sucesso
    // window.location.href = '/payment/success';
}

// Adicionar estilos CSS para o modal
const modalStyles = `
<style>
.payment-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.modal-content {
    background: #2d2d2d;
    padding: 2rem;
    border-radius: 12px;
    max-width: 500px;
    width: 90%;
    text-align: center;
}

.modal-content h3 {
    color: #F15A24;
    margin-bottom: 1.5rem;
}

.qr-code-container img {
    max-width: 200px;
    margin: 1rem 0;
}

.pix-code textarea,
.crypto-info textarea {
    width: 100%;
    height: 80px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #ffffff;
    padding: 0.5rem;
    border-radius: 4px;
    resize: none;
    margin: 0.5rem 0;
}

.modal-content button {
    background: linear-gradient(45deg, #F15A24, #F7931E);
    border: none;
    color: #ffffff;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    margin: 0.5rem;
}

@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', modalStyles);

