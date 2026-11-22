const CURRENCY = 'ETB'

// Accept the API base URL and also normalize the older full initialize URL.
// The controller appends /transaction/initialize and /transaction/verify itself.
function normalizeChapaBaseUrl(configuredUrl) {
    const value = String(configuredUrl || 'https://api.chapa.co/v1').trim()
    let parsed
    try {
        parsed = new URL(value)
    } catch (_) {
        throw new Error('CHAPA_URL must be a valid HTTPS Chapa API URL.')
    }

    if (parsed.protocol !== 'https:' || parsed.hostname !== 'api.chapa.co' || parsed.username || parsed.password || parsed.search || parsed.hash) {
        throw new Error('CHAPA_URL must use https://api.chapa.co and must not contain credentials, a query, or a fragment.')
    }

    const normalizedPath = parsed.pathname
        .replace(/(?:\/transaction\/initialize)+\/?$/i, '')
        .replace(/\/+$/, '')

    if (normalizedPath !== '/v1') {
        throw new Error('CHAPA_URL must point to the Chapa v1 API base: https://api.chapa.co/v1')
    }

    return `${parsed.origin}/v1`
}

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

module.exports = { CURRENCY, roundMoney, normalizeChapaBaseUrl, isChapaPaymentVerified, isChapaPaymentFailed }
