const CURRENCY = 'ETB'

function roundMoney(value) {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100
}

function isChapaPaymentVerified(responseOk, responseBody, order) {
    const payment = responseBody && responseBody.data
    if (!responseOk || responseBody?.status !== 'success' || !payment || !order) return false

    return String(payment.status || '').toLowerCase() === 'success' &&
        payment.tx_ref === order.tx_ref &&
        String(payment.currency || '').toUpperCase() === CURRENCY &&
        Number.isFinite(Number(payment.amount)) &&
        roundMoney(payment.amount) === roundMoney(order.TotalAmount)
}

function isChapaPaymentFailed(responseOk, responseBody, txRef) {
    const payment = responseBody && responseBody.data
    return Boolean(
        responseOk &&
        responseBody?.status === 'success' &&
        String(payment?.status || '').toLowerCase() === 'failed' &&
        payment?.tx_ref === txRef
    )
}

module.exports = { CURRENCY, roundMoney, isChapaPaymentVerified, isChapaPaymentFailed }
