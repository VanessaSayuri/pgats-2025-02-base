//Bibliotecas
const request = require('supertest')
const { expect } = require ('chai')


//Testes

describe('Checkout External', () => {
    describe('POST /api/checkout', () =>{

        beforeEach(async () =>{
            const respostaLogin = await request('http://localhost:3000')
                .post('/api/users/login')
                .send({
                    email: "alice@email.com",
                    password: "123456"
                    });
        token = respostaLogin.body.token;
        })

        it('Quando informo id de produto valido e pagamento com boleto status 200', async () => {

            const resposta = await request('http://localhost:3000')
                .post('/api/checkout')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    items: [
                        {
                        productId: 2,
                        quantity: 2
                        }
                    ],
                    freight: 0,
                    paymentMethod: "boleto"
                });

            expect(resposta.status).to.equal(200);
            
            respostaEsperada = require('../fixture/respostas/quandoInformoValoresValidosBoletoTenhoSucessoCom200.json')
            
            expect(resposta.body).to.deep.equal(respostaEsperada)
        })
        it('Quando informo id de produto valido e pagamento com cartão de crédito status 200', async () => {

            const resposta = await request('http://localhost:3000')
                .post('/api/checkout')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    items: [
                        {
                        productId: 2,
                        quantity: 2
                        }
                    ],
                    freight: 0,
                    paymentMethod: "credit_card",
                    cardData: {
                        number: "4111111111111111",
                        name: "Alice Souza",
                        expiry: "12/30",
                        cvv: "123"
                    }
                });

            expect(resposta.status).to.equal(200);
            respostaEsperada = require('../fixture/respostas/quandoInformoValoresValidosCartaoDeCreditoTenhoSucessoCom200.json')
            expect(resposta.body).to.deep.equal(respostaEsperada)
        })
        
        it('Quando informo id de produto invalido recebo Erro 400', async () => {

            const resposta = await request('http://localhost:3000')
                .post('/api/checkout')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    items: [
                        {
                        productId: 7,
                        quantity: 2
                        }
                    ],
                    freight: 0,
                    paymentMethod: "boleto"

                });
                
            expect(resposta.status).to.equal(400);
            expect(resposta.body).to.have.property('error', 'Produto não encontrado')
        })
         it('Quando informo id de produto valido e pagamento com cartão de crédito inválido recebo status 400', async () => {

            const resposta = await request('http://localhost:3000')
                .post('/api/checkout')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    items: [
                        {
                        productId: 2,
                        quantity: 2
                        }
                    ],
                    freight: 0,
                    paymentMethod: "credit_card"

                });

            expect(resposta.status).to.equal(400);
            expect(resposta.body).to.have.property('error', 'Dados do cartão obrigatórios para pagamento com cartão')
        })
    })
})