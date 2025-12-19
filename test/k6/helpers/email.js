//Utilizando a biblioteca "faker" para gerar emails com nomes mais realistas
import faker from "k6/x/faker";

// Função para gerar e-mails aleatórios únicos
export function generateRandomEmail() {
    const random = Math.random().toString(36).substring(2, 4);
    return `${faker.person.firstName()}.${random}@example.com`;
}
