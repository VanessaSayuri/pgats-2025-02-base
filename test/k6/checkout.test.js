import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { generateRandomEmail } from './helpers/email.js';
import { getBaseUrl } from './helpers/baseUrl.js';
import { login } from './helpers/login.js';
import { Trend } from 'k6/metrics';

import { SharedArray } from 'k6/data';


const users = new SharedArray('users', function () {
  return JSON.parse(open('./data/login.test.data.json'));
});



const postCheckoutDurationTrend = new Trend ('post_checkout_duration')

export const options = {
    // vus: 10,
    // // duration: '15s',
    // iterations: 10,
    thresholds: {
        http_req_duration: ['p(95)<2000'], // 95% das requisições devem ser < 2s
    },
    stages: [
        { duration: '3s', target: 5 }, // Ramp up
        { duration: '5s', target: 10 },  //Average
        { duration: '10s', target: 35 }, // Spike
        { duration: '3s', target: 0 },  // Ramp down
    ],
};


const password = ''
const user = users[(__VU - 1) % users.length] // Reaproveitamento de dados

export default function () {
    let email, token;

    group('Registrar usuário', function () {

        email = generateRandomEmail();
        
        const url = `${getBaseUrl()}/api/users/register`;
        
        const payload = JSON.stringify({
            name: user.name,
            email: email,
            password: user.password,
        });

        console.log(payload);
        const params = { headers: { 'Content-Type': 'application/json' } };
        const res = http.post(url, payload, params);
        check(res, { 'register status 201': (r) => r.status === 201 });
    });

    group('Login usuário', function () {

        token = login(email, user.password);
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
