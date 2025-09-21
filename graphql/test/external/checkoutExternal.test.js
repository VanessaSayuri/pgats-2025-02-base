const request = require('supertest');
const { expect } = require('chai');

describe('Checkout External - GraphQL', () => {


    beforeEach(async () =>{
        const loginUser = require('../fixture/requisicoes/loginUser.json')
        const respostaToken = await request('http://localhost:4000')
            .post('/graphql')
            .send(loginUser)
            token = respostaToken.body.data.login.token;
    });

    it('Quando informo id de produto valido e pagamento com boleto status 200', async() =>{

        const pagamentoBoleto = require('../fixture/requisicoes/pagamentoBoleto.json')
        const respostaPagamentoBoleto = await request('http://localhost:4000')
            .post('/graphql')
            .set('Authorization', `Bearer ${token}`)
            .send(pagamentoBoleto);
            
        expect(respostaPagamentoBoleto.status).to.equal(200);     

        respostaEsperadaBoleto = require('../fixture/respostas/quandoInformoIDdeProdutoValidoEPagamentoBoleto.json')
        expect(respostaPagamentoBoleto.body).to.deep.equal(respostaEsperadaBoleto)


    })
     it('Quando informo id de produto valido e pagamento com cartão de crédito status 200', async () => {
    
        const pagamentoCartaoDeCredito = require('../fixture/requisicoes/pagamentoCartaoDeCredito.json')
        const resposta = await request('http://localhost:4000')
            .post('/graphql')
            .set('Authorization', `Bearer ${token}`)
            .send(pagamentoCartaoDeCredito)
    
        expect(resposta.status).to.equal(200);

        respostaEsperada = require('../fixture/respostas/quandoInformoIDdeProdutoValidoEPagamentoComCartaoDeCredito.json')
        expect(resposta.body).to.deep.equal(respostaEsperada)

        })

    it('Quando informo id de produto invalido recebo mensagem de erro', async () => {

        const produtoInvalido = require('../fixture/requisicoes/produtoInvalido.json')
        const resposta = await request('http://localhost:4000')
            .post('/graphql')
            .set('Authorization', `Bearer ${token}`)
            .send(produtoInvalido);
            
            
        expect(resposta.status).to.equal(200);
        expect(resposta.body.errors[0].message).to.equal('Produto não encontrado')

    })

})