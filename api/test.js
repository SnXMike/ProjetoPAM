const assert = require('chai').assert;
const axios = require('axios');

describe('Testes da API', function () {
    let userId;

    it('Listar todos cadastros', async function () {
        const response = await axios.get('http://localhost:3000/cadastro');
        assert.equal(response.status, 200);
        assert.isArray(response.data);
    });

    it('Criar novo cadastro', async function () {
        const newUser = { cpf: "48141873865", nome: 'cadastro Teste', idade: 18, cep: "13802430", endereco: "Rua #####"  };
        const response = await axios.post('http://localhost:3000/cadastro', newUser);
        assert.equal(response.status, 200);
        assert.isObject(response.data);
        assert.property(response.data, 'id');
        assert.isNumber(response.data.id);
        userId = response.data.id; // store the user ID for use in the next test
    });

    it('Modificar cadastro', async function () {
        const updatedUserData = { cpf: "65837814184", nome: 'Teste cadastro', idade: 81, cep: "03420831", endereco: "Rua ******" }; // Dados atualizados do cadastro
        const response = await axios.put(`http://localhost:3000/cadastro/${userId}`, updatedUserData);
        assert.equal(response.status, 200);
        assert.isObject(response.data);
        
        // Converta o ID retornado para um número antes de fazer a asserção
        const returnedId = parseInt(response.data.id);
    
        // Verifica se os dados foram atualizados corretamente
        assert.equal(returnedId, userId);
        assert.propertyVal(response.data, 'cpf', updatedUserData.cpf);
        assert.propertyVal(response.data, 'nome', updatedUserData.nome);
        assert.propertyVal(response.data, 'idade', updatedUserData.idade);
        assert.propertyVal(response.data, 'cep', updatedUserData.cep);
        assert.propertyVal(response.data, 'endereco', updatedUserData.endereco);
    });

    it('Excluir cadastro', async function () {
        const response = await axios.delete(`http://localhost:3000/cadastro/${userId}`);
        assert.equal(response.status, 200);
        const deletedUser = response.data;
        assert.isObject(deletedUser);
        assert.propertyVal(deletedUser, 'id', userId);
    });

});
