import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { generateRandomEmail } from './helpers/email.js';
import { getBaseUrl } from './helpers/baseUrl.js';
import { login } from './helpers/login.js';
import { Trend } from 'k6/metrics';

const postCheckoutDurationTrend = new Trend ('post_checkout_duration')

export const options = {
    vus: 10,
    // duration: '15s',
    iterations: 10,
    thresholds: {
        http_req_duration: ['p(95)<2000'], // 95% das requisições devem ser < 2s
    },
};

const password = 'senha123';

export default function () {
    let email, token;

    group('Registrar usuário', function () {
        email = generateRandomEmail();
        const url = `${getBaseUrl()}/api/users/register`;
        const payload = JSON.stringify({
            name: `User_${__VU}_${__ITER}`,
            email: email,
            password: password,
        });

        console.log(payload);
        const params = { headers: { 'Content-Type': 'application/json' } };
        const res = http.post(url, payload, params);
        check(res, { 'register status 201': (r) => r.status === 201 });
    });

    group('Login usuário', function () {
        token = login(email, password);
        check(token, { 'token exists': (t) => !!t });
    });

    group('Checkout', function () {
        const url = `${getBaseUrl()}/api/checkout`;
        const payload = JSON.stringify({
            items: [{ productId: 1, quantity: 1 }],
            freight: 20,
            paymentMethod: 'boleto',
        });
        const params = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        };
        const res = http.post(url, payload, params);
        check(res, { 'checkout status 200': (r) => r.status === 200 });

        postCheckoutDurationTrend.add(res.timings.duration);
    });

    sleep(1);
}
