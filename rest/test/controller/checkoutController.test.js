//Bibliotecas
const request = require('supertest');
const { expect } = require ('chai');
const sinon = require('sinon');

// Aplicação
const app = require('../../app');

//Mock
const checkoutService = require('../../../src/services/checkoutService')

//Testes

describe('Checkout Controller', () => {
    describe('POST /api/checkout', () =>{

        beforeEach(async () =>{
            const respostaLogin = await request(app)
                .post('/api/users/login')
                .send({
                    email: "alice@email.com",
                    password: "123456"
                    });
        token = respostaLogin.body.token;
        })

        it('Mock: Quando informo id de produto valido e pagamento com boleto status 200', async () => {

            const checkoutServiceMock = sinon.stub(checkoutService, 'checkout');
            respostaEsperada = require('../fixture/respostas/quandoInformoValoresValidosBoletoTenhoSucessoCom200.json')
            checkoutServiceMock.returns(respostaEsperada)

            const resposta = await request(app)
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
            expect(resposta.body).to.deep.equal(respostaEsperada)
        })
        it('Mock: Quando informo id de produto valido e pagamento com cartão de crédito status 200', async () => {

            const checkoutServiceMock = sinon.stub(checkoutService, 'checkout');
            respostaEsperada = require('../fixture/respostas/quandoInformoValoresValidosCartaoDeCreditoTenhoSucessoCom200.json')
            checkoutServiceMock.returns(respostaEsperada)


            const resposta = await request(app)
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
            expect(resposta.body).to.deep.equal(respostaEsperada)

        })
        
        it('Mock: Quando informo id de produto invalido recebo Erro 400', async () => {

            const checkoutServiceMock = sinon.stub(checkoutService, 'calculateTotal');
            checkoutServiceMock.throws(new Error('Produto não encontrado'))

            const resposta = await request(app)
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
        });
        it('Mock: Quando informo id de produto valido e pagamento com cartão de crédito inválido recebo status 400', async () => {

        const checkoutServiceMock = sinon.stub(checkoutService, 'checkout');
        checkoutServiceMock.throws(new Error('Dados do cartão obrigatórios para pagamento com cartão'))
        
        const resposta = await request(app)
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
        //Resetar o mock
        afterEach(() => {
            sinon.restore();
        })
    });
});