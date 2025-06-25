// Variáveis globais
let paymentData = {};
let selectedCurrency = null;
let invoiceData = null;
let statusCheckInterval = null;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializePaymentData();
    loadCryptoCurrencies();
});

function initializePaymentData() {
    // Recuperar dados do pagamento da URL ou localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');
    
    if (dataParam) {
        try {
            paymentData = JSON.parse(decodeURIComponent(dataParam));
            updateOrderSummary();
        } catch (error) {
            console.error('Erro ao recuperar dados do pagamento:', error);
            // Dados padrão se houver erro
            paymentData = {
                product: 'AUTHORITY DAYZ',
                subscription_time: '1',
                email: '',
                total: 15.00
            };
        }
    }
}

function updateOrderSummary() {
    document.getElementById('order-product').textContent = paymentData.product || 'AUTHORITY DAYZ';
    document.getElementById('order-period').textContent = `${paymentData.subscription_time || '1'} Dia(s)`;
    document.getElementById('order-email').textContent = paymentData.email || '-';
    document.getElementById('order-total').textContent = `R$ ${(paymentData.total || 15.00).toFixed(2).replace('.', ',')}`;
}

async function loadCryptoCurrencies() {
    try {
        // Mostrar loading
        const cryptoGrid = document.getElementById('crypto-grid');
        cryptoGrid.innerHTML = '<div class="loading">Carregando criptomoedas...</div>';

        // Buscar moedas disponíveis
        const response = await fetch('https://sdkcheats-payment-backend.onrender.com/api/payment/crypto/currencies');
        const result = await response.json();

        if (result.success) {
            displayCryptoCurrencies(result.currencies);
        } else {
            // Fallback para moedas principais se a API falhar
            const fallbackCurrencies = {
                'BTC': { name: 'Bitcoin', icon: '₿' },
                'ETH': { name: 'Ethereum', icon: 'Ξ' },
                'USDT': { name: 'Tether', icon: '₮' },
                'LTC': { name: 'Litecoin', icon: 'Ł' },
                'BCH': { name: 'Bitcoin Cash', icon: '₿' },
                'DOGE': { name: 'Dogecoin', icon: 'Ð' }
            };
            displayCryptoCurrencies(fallbackCurrencies);
        }
    } catch (error) {
        console.error('Erro ao carregar criptomoedas:', error);
        showNotification('Erro ao carregar criptomoedas', 'error');
    }
}

function displayCryptoCurrencies(currencies) {
    const cryptoGrid = document.getElementById('crypto-grid');
    cryptoGrid.innerHTML = '';

    Object.entries(currencies).forEach(([code, info]) => {
        const cryptoCard = document.createElement('div');
        cryptoCard.className = 'crypto-card';
        cryptoCard.onclick = () => selectCurrency(code, info);
        
        cryptoCard.innerHTML = `
            <div class="crypto-icon">
                ${getCryptoIcon(code)}
            </div>
            <div class="crypto-name">${info.name || code}</div>
            <div class="crypto-code">${code}</div>
        `;
        
        cryptoGrid.appendChild(cryptoCard);
    });
}

function getCryptoIcon(code) {
    const icons = {
        'BTC': '<i class="fab fa-bitcoin"></i>',
        'ETH': '<i class="fab fa-ethereum"></i>',
        'LTC': '<i class="fas fa-coins"></i>',
        'BCH': '<i class="fab fa-bitcoin"></i>',
        'DOGE': '<i class="fas fa-dog"></i>',
        'USDT': '<i class="fas fa-dollar-sign"></i>'
    };
    return icons[code] || '<i class="fas fa-coins"></i>';
}

function selectCurrency(code, info) {
    // Remover seleção anterior
    document.querySelectorAll('.crypto-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Selecionar nova moeda
    event.currentTarget.classList.add('selected');
    selectedCurrency = { code, info };
    
    // Habilitar botão de criar fatura
    const createBtn = document.getElementById('create-invoice-btn');
    createBtn.disabled = false;
    createBtn.innerHTML = `<i class="fas fa-bitcoin"></i> Criar Fatura ${code}`;
}

async function createCryptoInvoice() {
    if (!selectedCurrency) {
        showNotification('Selecione uma criptomoeda primeiro', 'warning');
        return;
    }

    try {
        // Mostrar loading
        const createBtn = document.getElementById('create-invoice-btn');
        const originalText = createBtn.innerHTML;
        createBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando fatura...';
        createBtn.disabled = true;

        // Preparar dados para envio
        const invoiceRequest = {
            ...paymentData,
            currency: selectedCurrency.code
        };

        // Enviar para o backend
        const response = await fetch('https://sdkcheats-payment-backend.onrender.com/api/payment/crypto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(invoiceRequest)
        });

        const result = await response.json();

        if (result.success) {
            invoiceData = result;
            displayPaymentDetails(result);
            startStatusCheck(result.invoice_id);
        } else {
            throw new Error(result.message || 'Erro ao criar fatura');
        }

    } catch (error) {
        console.error('Erro ao criar fatura:', error);
        showNotification(error.message || 'Erro ao criar fatura', 'error');
        
        // Restaurar botão
        const createBtn = document.getElementById('create-invoice-btn');
        createBtn.innerHTML = `<i class="fas fa-bitcoin"></i> Criar Fatura ${selectedCurrency.code}`;
        createBtn.disabled = false;
    }
}

function displayPaymentDetails(invoice) {
    // Ocultar seleção de moeda
    document.getElementById('currency-selection').style.display = 'none';
    
    // Mostrar detalhes do pagamento
    const paymentDetails = document.getElementById('payment-details');
    paymentDetails.style.display = 'block';
    
    // Preencher informações
    document.getElementById('crypto-amount').textContent = `${invoice.amount} ${invoice.currency}`;
    document.getElementById('crypto-currency').textContent = invoice.currency;
    document.getElementById('wallet-address').value = invoice.wallet_address;
    
    // Mostrar QR Code se disponível
    if (invoice.qr_code) {
        const qrImg = document.getElementById('qr-code');
        qrImg.src = invoice.qr_code;
        qrImg.style.display = 'block';
        document.getElementById('qr-placeholder').style.display = 'none';
    }
    
    // Atualizar botão
    const createBtn = document.getElementById('create-invoice-btn');
    createBtn.innerHTML = '<i class="fas fa-external-link-alt"></i> Abrir no Plisio';
    createBtn.onclick = () => window.open(invoice.invoice_url, '_blank');
    createBtn.disabled = false;
}

function copyAddress() {
    const addressInput = document.getElementById('wallet-address');
    addressInput.select();
    addressInput.setSelectionRange(0, 99999); // Para mobile
    
    try {
        document.execCommand('copy');
        showNotification('Endereço copiado!', 'success');
        
        // Feedback visual
        const copyBtn = document.getElementById('copy-address');
        const originalIcon = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
            copyBtn.innerHTML = originalIcon;
        }, 2000);
    } catch (error) {
        showNotification('Erro ao copiar endereço', 'error');
    }
}

function startStatusCheck(invoiceId) {
    // Verificar status a cada 30 segundos
    statusCheckInterval = setInterval(async () => {
        try {
            const response = await fetch(`https://sdkcheats-payment-backend.onrender.com/api/payment/crypto/status/${invoiceId}`);
            const result = await response.json();
            
            if (result.success) {
                updatePaymentStatus(result.status, result.data);
                
                // Parar verificação se pagamento foi concluído
                if (result.status === 'completed' || result.status === 'confirmed') {
                    clearInterval(statusCheckInterval);
                    showPaymentSuccess(result.data);
                }
            }
        } catch (error) {
            console.error('Erro ao verificar status:', error);
        }
    }, 30000);
}

function updatePaymentStatus(status, data) {
    const statusElement = document.getElementById('payment-status');
    const statusIndicator = statusElement.querySelector('.status-indicator');
    
    let icon, text, className;
    
    switch (status) {
        case 'pending':
            icon = 'fas fa-clock';
            text = 'Aguardando pagamento...';
            className = 'pending';
            break;
        case 'processing':
            icon = 'fas fa-spinner fa-spin';
            text = 'Processando pagamento...';
            className = 'processing';
            break;
        case 'completed':
        case 'confirmed':
            icon = 'fas fa-check-circle';
            text = 'Pagamento confirmado!';
            className = 'success';
            break;
        case 'failed':
            icon = 'fas fa-times-circle';
            text = 'Pagamento falhou';
            className = 'error';
            break;
        default:
            icon = 'fas fa-question-circle';
            text = `Status: ${status}`;
            className = 'unknown';
    }
    
    statusIndicator.innerHTML = `<i class="${icon}"></i><span>${text}</span>`;
    statusElement.className = `payment-status ${className}`;
}

function showPaymentSuccess(data) {
    // Criar modal de sucesso
    const modal = document.createElement('div');
    modal.className = 'payment-modal success-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3>Pagamento Confirmado!</h3>
            <div class="payment-details">
                <p><strong>Transação:</strong> ${data.txid || 'Confirmada'}</p>
                <p><strong>Valor:</strong> ${invoiceData.amount} ${invoiceData.currency}</p>
                <p><strong>Status:</strong> Confirmado</p>
            </div>
            <div class="success-message">
                Seu pagamento foi confirmado com sucesso! Você receberá as informações do produto por email em breve.
            </div>
            <button onclick="goToSuccess()" class="success-btn">
                Continuar
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
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
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196F3'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;

    document.body.appendChild(notification);

    // Remover após 5 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

function goBack() {
    // Limpar interval se estiver rodando
    if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
    }
    
    // Voltar para a página de seleção de pagamento
    window.history.back();
}

function goToSuccess() {
    // Limpar interval se estiver rodando
    if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
    }
    
    // Redirecionar para página de sucesso ou fechar modal
    const modal = document.querySelector('.payment-modal');
    if (modal) {
        document.body.removeChild(modal);
    }
    
    showNotification('Obrigado pela sua compra!', 'success');
}

// Adicionar estilos CSS para criptomoedas
const cryptoStyles = `
<style>
.crypto-selection {
    margin-bottom: 2rem;
}

.crypto-selection h3 {
    color: #F15A24;
    margin-bottom: 1rem;
    font-size: 1.2rem;
}

.crypto-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.crypto-card {
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1.5rem 1rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
}

.crypto-card:hover {
    border-color: #F15A24;
    background: rgba(241, 90, 36, 0.1);
    transform: translateY(-2px);
}

.crypto-card.selected {
    border-color: #F15A24;
    background: rgba(241, 90, 36, 0.2);
}

.crypto-icon {
    font-size: 2rem;
    color: #F15A24;
    margin-bottom: 0.5rem;
}

.crypto-name {
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 0.25rem;
}

.crypto-code {
    color: #cccccc;
    font-size: 0.9rem;
}

.payment-details {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
}

.payment-details h3 {
    color: #F15A24;
    margin-bottom: 1rem;
    font-size: 1.2rem;
}

.crypto-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
}

.crypto-amount,
.crypto-currency {
    display: flex;
    justify-content: space-between;
    color: #cccccc;
}

.crypto-amount span:last-child,
.crypto-currency span:last-child {
    color: #F15A24;
    font-weight: bold;
}

.wallet-section,
.qr-section {
    margin-bottom: 1.5rem;
}

.wallet-section h4,
.qr-section h4 {
    color: #F15A24;
    margin-bottom: 0.5rem;
    font-size: 1rem;
}

.wallet-address-container {
    display: flex;
    gap: 0.5rem;
}

.wallet-address-container input {
    flex: 1;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #ffffff;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    font-family: monospace;
    font-size: 0.9rem;
}

#copy-address {
    background: #F15A24;
    border: none;
    color: #ffffff;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.3s ease;
}

#copy-address:hover {
    background: #d14a1f;
}

.qr-container {
    text-align: center;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
}

#qr-code {
    max-width: 200px;
    height: auto;
    border-radius: 8px;
}

#qr-placeholder {
    color: #cccccc;
    padding: 2rem;
}

.payment-instructions {
    background: rgba(255, 255, 255, 0.05);
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
}

.payment-instructions h4 {
    color: #F15A24;
    margin-bottom: 0.5rem;
}

.payment-instructions ol {
    color: #cccccc;
    padding-left: 1.5rem;
}

.payment-instructions li {
    margin-bottom: 0.5rem;
    line-height: 1.4;
}

.payment-status {
    text-align: center;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
}

.payment-status.pending {
    background: rgba(255, 193, 7, 0.1);
    border: 1px solid rgba(255, 193, 7, 0.3);
}

.payment-status.processing {
    background: rgba(33, 150, 243, 0.1);
    border: 1px solid rgba(33, 150, 243, 0.3);
}

.payment-status.success {
    background: rgba(76, 175, 80, 0.1);
    border: 1px solid rgba(76, 175, 80, 0.3);
}

.payment-status.error {
    background: rgba(244, 67, 54, 0.1);
    border: 1px solid rgba(244, 67, 54, 0.3);
}

.status-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    color: #ffffff;
    font-weight: 500;
}

.action-buttons {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.loading {
    text-align: center;
    color: #cccccc;
    padding: 2rem;
}

@media (max-width: 768px) {
    .crypto-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .crypto-info {
        grid-template-columns: 1fr;
    }
    
    .wallet-address-container {
        flex-direction: column;
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', cryptoStyles);

