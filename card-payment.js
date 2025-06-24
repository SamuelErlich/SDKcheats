// Configuração do Mercado Pago
const mp = new MercadoPago('APP_USR-31cdbb2c-a937-4137-ada9-08f7f8785d9e', {
    locale: 'pt-BR'
});

// Variáveis globais
let cardForm;
let paymentData = {};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializePaymentData();
    initializeMercadoPago();
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
                total: 15.90
            };
        }
    }
}

function updateOrderSummary() {
    document.getElementById('order-product').textContent = paymentData.product || 'AUTHORITY DAYZ';
    document.getElementById('order-period').textContent = `${paymentData.subscription_time || '1'} Dia(s)`;
    document.getElementById('order-email').textContent = paymentData.email || '-';
    document.getElementById('order-total').textContent = `R$ ${(paymentData.total || 15.90).toFixed(2).replace('.', ',')}`;
    
    // Preencher email automaticamente
    if (paymentData.email) {
        document.getElementById('form-checkout__cardholderEmail').value = paymentData.email;
    }
}

async function initializeMercadoPago() {
    try {
        // Criar formulário de cartão
        cardForm = mp.cardForm({
            amount: String(paymentData.total || 15.90),
            iframe: true,
            form: {
                id: "card-form",
                cardNumber: {
                    id: "form-checkout__cardNumber",
                    placeholder: "Número do cartão",
                },
                expirationDate: {
                    id: "form-checkout__expirationDate",
                    placeholder: "MM/YY",
                },
                securityCode: {
                    id: "form-checkout__securityCode",
                    placeholder: "CVV",
                },
                cardholderName: {
                    id: "form-checkout__cardholderName",
                    placeholder: "Nome no cartão",
                },
                issuer: {
                    id: "form-checkout__issuer",
                    placeholder: "Banco emissor",
                },
                installments: {
                    id: "form-checkout__installments",
                    placeholder: "Parcelas",
                },
                identificationType: {
                    id: "form-checkout__identificationType",
                    placeholder: "Tipo de documento",
                },
                identificationNumber: {
                    id: "form-checkout__identificationNumber",
                    placeholder: "Número do documento",
                },
                cardholderEmail: {
                    id: "form-checkout__cardholderEmail",
                    placeholder: "Email",
                },
            },
            callbacks: {
                onFormMounted: error => {
                    if (error) {
                        console.error('Erro ao montar formulário:', error);
                        showNotification('Erro ao carregar formulário de pagamento', 'error');
                    } else {
                        console.log('Formulário montado com sucesso');
                    }
                },
                onSubmit: event => {
                    event.preventDefault();
                    processCardPayment();
                },
                onFetching: (resource) => {
                    console.log('Buscando:', resource);
                    // Mostrar loading se necessário
                }
            },
        });

    } catch (error) {
        console.error('Erro ao inicializar Mercado Pago:', error);
        showNotification('Erro ao inicializar sistema de pagamento', 'error');
    }
}

async function processCardPayment() {
    try {
        // Mostrar loading
        const submitBtn = document.getElementById('form-checkout__submit');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
        submitBtn.disabled = true;

        // Obter dados do formulário
        const formData = cardForm.getCardFormData();
        
        if (!formData.token) {
            throw new Error('Erro ao gerar token do cartão');
        }

        // Preparar dados para envio
        const paymentRequest = {
            ...paymentData,
            card_data: {
                token: formData.token,
                payment_method_id: formData.payment_method_id,
                installments: formData.installments,
                issuer_id: formData.issuer_id
            }
        };

        // Enviar para o backend
        const response = await fetch('/api/payment/card', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentRequest)
        });

        const result = await response.json();

        if (result.success) {
            showPaymentSuccess(result);
        } else {
            throw new Error(result.message || 'Erro no processamento do pagamento');
        }

    } catch (error) {
        console.error('Erro no pagamento:', error);
        showNotification(error.message || 'Erro no processamento do pagamento', 'error');
        
        // Restaurar botão
        const submitBtn = document.getElementById('form-checkout__submit');
        submitBtn.innerHTML = '<i class="fas fa-credit-card"></i> Pagar com Cartão';
        submitBtn.disabled = false;
    }
}

function showPaymentSuccess(result) {
    // Criar modal de sucesso
    const modal = document.createElement('div');
    modal.className = 'payment-modal success-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3>Pagamento Processado!</h3>
            <div class="payment-details">
                <p><strong>Status:</strong> ${getStatusText(result.status)}</p>
                <p><strong>ID do Pagamento:</strong> ${result.payment_id}</p>
                <p><strong>Valor:</strong> R$ ${result.amount.toFixed(2).replace('.', ',')}</p>
            </div>
            <div class="success-message">
                ${getSuccessMessage(result.status)}
            </div>
            <button onclick="goToSuccess()" class="success-btn">
                Continuar
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function getStatusText(status) {
    const statusMap = {
        'approved': 'Aprovado',
        'pending': 'Pendente',
        'in_process': 'Em processamento',
        'rejected': 'Rejeitado'
    };
    return statusMap[status] || status;
}

function getSuccessMessage(status) {
    switch (status) {
        case 'approved':
            return 'Seu pagamento foi aprovado! Você receberá as informações do produto por email em breve.';
        case 'pending':
            return 'Seu pagamento está sendo processado. Você receberá uma confirmação por email.';
        case 'in_process':
            return 'Seu pagamento está em análise. Aguarde a confirmação por email.';
        default:
            return 'Pagamento processado. Verifique seu email para mais informações.';
    }
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
    // Voltar para a página de seleção de pagamento
    window.history.back();
}

function goToSuccess() {
    // Redirecionar para página de sucesso ou fechar modal
    const modal = document.querySelector('.payment-modal');
    if (modal) {
        document.body.removeChild(modal);
    }
    
    // Aqui você pode redirecionar para uma página de sucesso
    // window.location.href = '/payment/success';
    
    showNotification('Obrigado pela sua compra!', 'success');
}

// Adicionar estilos CSS para o modal e notificações
const additionalStyles = `
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
    color: #ffffff;
}

.success-icon {
    font-size: 4rem;
    color: #4CAF50;
    margin-bottom: 1rem;
}

.modal-content h3 {
    color: #F15A24;
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
}

.payment-details {
    background: rgba(255, 255, 255, 0.1);
    padding: 1rem;
    border-radius: 8px;
    margin: 1rem 0;
    text-align: left;
}

.payment-details p {
    margin: 0.5rem 0;
}

.success-message {
    margin: 1.5rem 0;
    color: #cccccc;
    line-height: 1.6;
}

.success-btn {
    background: linear-gradient(45deg, #F15A24, #F7931E);
    border: none;
    color: #ffffff;
    padding: 1rem 2rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 1rem;
    transition: transform 0.3s ease;
}

.success-btn:hover {
    transform: translateY(-2px);
}

.order-summary {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
}

.order-summary h3 {
    color: #F15A24;
    margin-bottom: 1rem;
    font-size: 1.2rem;
}

.summary-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    color: #cccccc;
}

.summary-item.total {
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    padding-top: 0.75rem;
    font-weight: bold;
    font-size: 1.1rem;
    color: #ffffff;
}

.summary-item.total span:last-child {
    color: #F15A24;
}

.form-section {
    margin-bottom: 2rem;
}

.form-section h3 {
    color: #F15A24;
    margin-bottom: 1rem;
    font-size: 1.1rem;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: #cccccc;
    font-weight: 500;
}

.mp-input,
.mp-select,
#form-checkout__cardholderName,
#form-checkout__cardholderEmail,
#form-checkout__identificationNumber {
    width: 100%;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #ffffff;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
}

.mp-input:focus,
.mp-select:focus,
#form-checkout__cardholderName:focus,
#form-checkout__cardholderEmail:focus,
#form-checkout__identificationNumber:focus {
    outline: none;
    border-color: #F15A24;
}

.pay-btn {
    width: 100%;
    background: linear-gradient(45deg, #F15A24, #F7931E);
    border: none;
    color: #ffffff;
    padding: 1rem 2rem;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.pay-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(241, 90, 36, 0.3);
}

.pay-btn:disabled {
    background: rgba(255, 255, 255, 0.2);
    cursor: not-allowed;
    transform: none;
}

.back-btn {
    width: 100%;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: #ffffff;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.back-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: #F15A24;
}

@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}

@media (max-width: 768px) {
    .form-row {
        grid-template-columns: 1fr;
    }
    
    .payment-card {
        margin: 1rem;
        padding: 1.5rem;
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', additionalStyles);

