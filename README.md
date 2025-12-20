# API Checkout Rest e GraphQL

Se você é aluno da Pós-Graduação em Automação de Testes de Software (Turma 2), faça um fork desse repositório e boa sorte em seu trabalho de conclusão da disciplina.

## Instalação

```bash
npm install express jsonwebtoken swagger-ui-express apollo-server-express graphql
```

## Exemplos de chamadas

### REST

#### Registro de usuário
```bash
curl -X POST http://localhost:3000/api/users/register \
	-H "Content-Type: application/json" \
	-d '{"name":"Novo Usuário","email":"novo@email.com","password":"senha123"}'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/users/login \
	-H "Content-Type: application/json" \
	-d '{"email":"novo@email.com","password":"senha123"}'
```

#### Checkout (boleto)
```bash
curl -X POST http://localhost:3000/api/checkout \
	-H "Content-Type: application/json" \
	-H "Authorization: Bearer <TOKEN_JWT>" \
	-d '{
		"items": [{"productId":1,"quantity":2}],
		"freight": 20,
		"paymentMethod": "boleto"
	}'
```

#### Checkout (cartão de crédito)
```bash
curl -X POST http://localhost:3000/api/checkout \
	-H "Content-Type: application/json" \
	-H "Authorization: Bearer <TOKEN_JWT>" \
	-d '{
		"items": [{"productId":2,"quantity":1}],
		"freight": 15,
		"paymentMethod": "credit_card",
		"cardData": {
			"number": "4111111111111111",
			"name": "Nome do Titular",
			"expiry": "12/30",
			"cvv": "123"
		}
	}'
```

### GraphQL

#### Registro de usuário
Mutation:
```graphql
mutation Register($name: String!, $email: String!, $password: String!) {
  register(name: $name, email: $email, password: $password) {
    email
    name
  }
}

Variables:
{
  "name": "Julio",
  "email": "julio@abc.com",
  "password": "123456"
}
```

#### Login
Mutation:
```graphql
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
  }
}

Variables:
{
  "email": "alice@email.com",
  "password": "123456"
}
```


#### Checkout (boleto)
Mutation (envie o token JWT no header Authorization: Bearer <TOKEN_JWT>):
```graphql
mutation Checkout($items: [CheckoutItemInput!]!, $freight: Float!, $paymentMethod: String!, $cardData: CardDataInput) {
  checkout(items: $items, freight: $freight, paymentMethod: $paymentMethod, cardData: $cardData) {
    freight
    items {
      productId
      quantity
    }
    paymentMethod
    userId
    valorFinal
  }
}

Variables:
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 2,
      "quantity": 1
    }
  ],
  "freight": 10,
  "paymentMethod": "boleto"
}
```

#### Checkout (cartão de crédito)
Mutation (envie o token JWT no header Authorization: Bearer <TOKEN_JWT>):
```graphql
mutation {
	checkout(
		items: [{productId: 2, quantity: 1}],
		freight: 15,
		paymentMethod: "credit_card",
		cardData: {
			number: "4111111111111111",
			name: "Nome do Titular",
			expiry: "12/30",
			cvv: "123"
		}
	) {
		valorFinal
		paymentMethod
		freight
		items { productId quantity }
	}
}

Variables:
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 2,
      "quantity": 1
    }
  ],
  "freight": 10,
  "paymentMethod": "credit_card",
  "cardData": {
    "cvv": "123",
    "expiry": "10/04",
    "name": "Julio Costa",
    "number": "1234432112344321"
  }
}
```

#### Consulta de usuários
Query:
```graphql
query Users {
  users {
    email
    name
  }
}
```

## Como rodar

### REST
```bash
node rest/server.js
```
Acesse a documentação Swagger em [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

### GraphQL
```bash
node graphql/app.js
```
Acesse o playground GraphQL em [http://localhost:4000/graphql](http://localhost:4000/graphql)

## Endpoints REST
- POST `/api/users/register` — Registro de usuário
- POST `/api/users/login` — Login (retorna token JWT)
- POST `/api/checkout` — Checkout (requer token JWT)

## Regras de Checkout
- Só pode fazer checkout com token JWT válido
- Informe lista de produtos, quantidades, valor do frete, método de pagamento e dados do cartão se necessário
- 5% de desconto no valor total se pagar com cartão
- Resposta do checkout contém valor final

## Banco de dados
- Usuários e produtos em memória (veja arquivos em `src/models`)

## Testes
- Para testes automatizados, importe o `app` de `rest/app.js` ou `graphql/app.js` sem o método `listen()`

## Documentação
- Swagger disponível em `/api-docs`
- Playground GraphQL disponível em `/graphql`



# Testes automatizados de performance com K6

Foram implementados testes de performance utilizando todos os principais conceitos de performance e carga.

## Estrutura de pastas

```
.
└── test/
    └── k6/
        ├── data/                     # Massa de dados para os testes
        │   └── login.test.data.json  # Nomes e senhas de usuários
        ├── helpers/                  # Funções auxiliares e configurações
        │   ├── baseUrl.js            # Gerenciamento da URL base do ambiente
        │   ├── email.js              # Funções para manipulação/geração de e-mails
        │   └── login.js              # Lógica de autenticação e obtenção de tokens
        └── checkout.test.js          # Script principal de teste do fluxo de checkout
```


## Execução dos testes

Para executar o teste de checkout, utilize o comando:

```bash
k6 run --env BASE_URL=http://localhost:3000 test/k6/checkout.test.js
```

Para execução dos testes com geração de relatório, utilize o comando:

```bash
K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=html-report.html K6_WEB_DASHBOARD_PERIOD=2s k6 run --env BASE_URL=http://localhost:3000 test/k6/checkout.test.js
```

## Conceitos implementados

**1. Thresholds**

São úteis para definir os limites aceitáveis de performace. Neste projeto, foi definido que pelo menos 95% das requisições devem ter um tempo de resposta inferior a 2s.

**Local do arquivo:** `test/k6/checkout.test.js`

```js
export const options = {
    thresholds: {
        http_req_duration: ['p(95)<2000'], // 95% das requisições devem ser < 2s
    },
``` 


**2. Checks**

Servem para validar as respostas das requisições durante o teste. No exemplo abaixo, é feita a validação se o registro de usuário retorna o status 201.

**Local do arquivo:** `test/k6/checkout.test.js`

```js
group('Registrar usuário', function () {

        email = generateRandomEmail();
        
        const url = `${getBaseUrl()}/api/users/register`;
        
        const payload = JSON.stringify({
            name: user.name,
            email: email,
            password: user.password,
        });

        const params = { headers: { 'Content-Type': 'application/json' } };
        const res = http.post(url, payload, params);
        check(res, { 'register status 201': (r) => r.status === 201 });
    });
```

**3. Helpers**

São funções de apoio que tornam o código reutilizável. No código abaixo, a função `getBaseUrl()` é utilizada para passar a URL base da API, evitando que a URL fique repetida ao longo do código, facilitando a manutenção.

**Local do arquivo:** `test/k6/checkout.test.js`

```js
    group('Registrar usuário', function () {

        email = generateRandomEmail();
        
        const url = `${getBaseUrl()}/api/users/register`;
        
        const payload = JSON.stringify({
            name: user.name,
            email: email,
            password: user.password,
        });

        const params = { headers: { 'Content-Type': 'application/json' } };
        const res = http.post(url, payload, params);
        check(res, { 'register status 201': (r) => r.status === 201 });
    });
```

**Local do arquivo da função `getBaseUrl()`**: `test/k6/helpers/baseUrl.js`

```js
export function getBaseUrl() {
    return __ENV.BASE_URL || 'http://localhost:3000';
}
```


**4. Trends**

São métricas customizadas que permitem coletar dados ao longo de um teste para o cálculo automático de estatísticas. No exemplo abaixo, capturamos os valores numéricos das requisições de checkout. O K6 processa esses dados e gera automaticamente indicadores essenciais, como mínimo, máximo, média e os percentis p90, p95 e p99."

**Local do arquivo:** `test/k6/checkout.test.js`

```js
import { Trend } from 'k6/metrics';

const postCheckoutDurationTrend = new Trend ('post_checkout_duration')

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

```

**5. Faker**

É uma extensão do K6 que gera dados aleatórios realistas para os testes. No código, essa extensão foi utilizada para gerar emails aleatórios com nomes realistas.

**Local do arquivo:** ``test/k6/helpers/email.js`

```js
//Utilizando a biblioteca "faker" para gerar emails com nomes mais realistas
import faker from "k6/x/faker";

// Função para gerar e-mails aleatórios únicos
export function generateRandomEmail() {
    const random = Math.random().toString(36).substring(2, 4);
    return `${faker.person.firstName()}.${random}@example.com`;
}

```

**6. Variável de ambiente**

São valores externos que são informados no script de teste sem precisar alterar o código-fonte. No K6 as variáveis de ambiente são expostas através do objeto global __ENV. No código abaixo a função verifica se a variável de ambiente foi passada por linha comando, se não for definida é utilizado o valor http://localhost:3000'. 

**Local do arquivo**: `test/k6/helpers/baseUrl.js`

```js
export function getBaseUrl() {
    return __ENV.BASE_URL || 'http://localhost:3000';
}

```

Para utilizar variável de ambiente por linha comando, deve ser utilizada a flag `-e` ou `--env`.

Para executar o teste basta utilizar o seguinte comando:

```bash
k6 run --env BASE_URL=http://localhost:3000 test/k6/checkout.test.js
```

**7. Stages**

Stages definem diferentes fases de carga de teste ao longo do tempo. Com stages é possivel simular os estágios de  Ramp up, Average, Spike e Ramp down, como foi utilizado no código.

**Local do arquivo**: `test/k6/checkout.test.js`

```js
export const options = {

    stages: [
        { duration: '3s', target: 5 }, // Ramp up
        { duration: '5s', target: 10 },  //Average
        { duration: '10s', target: 35 }, // Spike
        { duration: '3s', target: 0 },  // Ramp down
    ],
};

```


**8. Reaproveitamento de resposta**

Consiste em extrair dados da resposta de uma requisição para utilizá-los em requisições posteriores. No código abaixo foi extraído o token JWT no group `Login usuário` e em seguida utilizado no header `Authorization: Bearer ${token} ` do group `Checkout`

**Local do arquivo onde ele é extraído**: `test/k6/helpers/login.js`

```js
export function login(email, password) {
    const url = `${getBaseUrl()}/api/users/login`;
    const payload = JSON.stringify({ email, password });
    const params = { headers: { 'Content-Type': 'application/json' } };
    const res = http.post(url, payload, params);
    check(res, { 'login status 200': (r) => r.status === 200 });
    const token = res.json('token');
    return token;
}

```


**Local do arquivo onde é utilizado**: `test/k6/checkout.test.js`

```js
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

    });

```


**9. Uso de Token de Autenticação**

Token de autenticação JWT é usado para comprovar que o usuário está logado e autorizado a acessar determinadas funcionalidades do sistema. 

**Local do arquivo onde ele é extraído**: `test/k6/helpers/login.js`

```js
export function login(email, password) {
    const url = `${getBaseUrl()}/api/users/login`;
    const payload = JSON.stringify({ email, password });
    const params = { headers: { 'Content-Type': 'application/json' } };
    const res = http.post(url, payload, params);
    check(res, { 'login status 200': (r) => r.status === 200 });
    const token = res.json('token');
    return token;
}

```


**Local do arquivo onde ele é usado**: `test/k6/checkout.test.js`

```js
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

```

**10. Data-Driven Testing**

É uma técnica de automação em que a lógica do teste é separada dos dados de entrada. Nos testes utilzados neste projeto, os dados de entrada estão armazenados em um arquivo JSON, que possui diferentes valores para as senhas utilizadas no registro e login dos usuários.

**Local do arquivo de dados**: `test/k6/data/login.test.data.json`

```json
[
    {
        "name": "Lysanne",
        "password": "senha123"
    },
    {
        "name": "Lupe",
        "password": "senha456"
    },
    {
        "name": "Brendan",
        "password": "senha789"
    }

]

```


**Local do arquivo onde ele é usado**: `test/k6/checkout.test.js`

```js

import { SharedArray } from 'k6/data';


const users = new SharedArray('users', function () {
  return JSON.parse(open('./data/login.test.data.json'));
});

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

        const params = { headers: { 'Content-Type': 'application/json' } };
        const res = http.post(url, payload, params);
        check(res, { 'register status 201': (r) => r.status === 201 });
    });

    group('Login usuário', function () {

        token = login(email, user.password);
        check(token, { 'token exists': (t) => !!t });
    });

```

**11. Groups**

São funções utilizadas para organizar o teste em etapas lógicas, deixando claro o que está sendo testado em cada parte. No projeto foi utilizado para dividir os testes em Registro do usuário, Login e Checkout.


**Local do arquivo**: `test/k6/checkout.test.js`

```js
group('Registrar usuário', function () {

	email = generateRandomEmail();
	
	const url = `${getBaseUrl()}/api/users/register`;
	
	const payload = JSON.stringify({
		name: user.name,
		email: email,
		password: user.password,
	});

	const params = { headers: { 'Content-Type': 'application/json' } };
	const res = http.post(url, payload, params);
	check(res, { 'register status 201': (r) => r.status === 201 });
});

group('Login usuário', function () {

	token = login(email, user.password);
	check(token, { 'token exists': (t) => !!t });
});

```

