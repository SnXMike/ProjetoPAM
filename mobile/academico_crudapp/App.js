import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList } from 'react-native';
import axios from 'axios';

// Definindo a URL da API 
const API_URL = 'http://172.16.7.6:3000/cadastro';

// Criando um componente para renderizar cada item da lista de cadastros 
const CadastroItem = ({ cadastro, onDelete, onEdit }) => {
  return (
    <View style={styles.CadastroItem}>
      <Text style={styles.CadastroId}>ID: {cadastro.id}</Text>
      <Text style={styles.CadastroCpf}>CPF: {cadastro.cpf}</Text>
      <Text style={styles.CadastroNome}>Nome: {cadastro.nome}</Text>
      <Text style={styles.CadastroIdade}>Idade: {cadastro.idade}</Text>
      <Text style={styles.CadastroCep}>CEP: {cadastro.cep}</Text>
      <Text style={styles.CadastroEndereco}>Endereço completo: {cadastro.endereco}</Text>
      <View style={styles.CadastroActions}>
        <Button title="Editar" onPress={() => onEdit(cadastro)} />
        <Button title="Excluir" onPress={() => onDelete(cadastro.id)} />
      </View>
    </View>
  );
};

// Criando um componente para o formulário de cadastro e edição de cadastros 
const CadastroForm = ({ cadastro, onSave, onCancel }) => {
  const [id, setId] = useState(null);
  const [cpf, setCpf] = useState(cadastro ? cadastro.cpf : '');
  const [nome, setNome] = useState(cadastro ? cadastro.nome : '');
  const [idade, setIdade] = useState(cadastro ? cadastro.idade : '');
  const [cep, setCep] = useState(cadastro ? cadastro.cep : '');
  const [endereco, setEndereco] = useState(cadastro ? cadastro.endereco : '');

  const handleSubmit = () => {
    if (cadastro) {
      // Atualizando um cadastro existente 
      axios.put(`${API_URL}/${cadastro.id}`, { cpf: cpf, nome: nome, idade: idade, cep: cep, endereco: endereco })
        .then(() => onSave())
        .catch((error) => alert(error.messdescricao));
    } else {
      // Criando um novo cadastro 
      axios.post(API_URL, {id: id,cpf: cpf, nome: nome, idade: idade, cep: cep, endereco: endereco })
        .then(() => onSave())
        .catch((error) => alert(error.messdescricao));
    }
  };

  //Puxando as informações do link viacep e as colocando em uma constante
  const fetchAddress = async () => {
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      const { logradouro, bairro, localidade, uf } = response.data;
      setEndereco(`${logradouro}, ${bairro}, ${localidade} - ${uf}`);
    } catch (error) {
      console.error('Erro ao buscar endereço:', error);
      setEndereco('');
    }
  };

  return (
    <View style={styles.CadastroForm}>
      <TextInput
        style={styles.input}
        placeholder="cpf"
        value={cpf}
        onChangeText={setCpf}
      />
      <TextInput
        style={styles.input}
        placeholder="nome"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={styles.input}
        placeholder="idade"
        value={idade}
        onChangeText={setIdade}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="cep"
        value={cep}
        onChangeText={setCep}
        keyboardType="numeric"
     />
      {/* Botão criado para testar se o Cep posto está correto e preenchendo a constante 'endereco'*/}
      <Button title="Buscar Endereço" onPress={fetchAddress} disabled={cep.length !== 8} />
      <TextInput
        style={styles.input}
        placeholder="Endereço completo"
        value={endereco}
        onChangeText={setEndereco}
        editable={false}
        textAlign="center"
      />
      <View style={styles.formActions}>
        <Button title="Salvar" onPress={handleSubmit} disabled={cpf.length == 0 || nome.length == 0 || idade.length == 0 || cep.length !== 8 || endereco.length == 0} />
        <Button title="Cancelar" onPress={onCancel} />
      </View>
    </View>
  );
};

// Criando um componente para a tela principal da aplicação 

const App = () => {
  const [cadastros, setcadastros] = useState([]);
  const [selectedcadastro, setSelectedcadastro] = useState(null);
  const [mostraForm, setMostraForm] = useState(false);

  useEffect(() => {

    // Buscando os cadastros da API quando o componente é montado 

    fetchcadastros();

  }, []);

  const fetchcadastros = () => {
    // Buscando os cadastros da API e atualizando o estado 
    axios.get(API_URL)
      .then((response) => setcadastros(response.data))
      .catch((error) => alert(error.messdescricao));
  };

  const handleDeletecadastro = (id) => {

    // Excluindo um cadastro da API e atualizando o estado 

    axios.delete(`${API_URL}/${id}`)

      .then(() => fetchcadastros())

      .catch((error) => alert(error.messdescricao));

  };

  const handleEditcadastro = (cadastro) => {

    // Selecionando um cadastro para editar e mostrando o formulário 

    setSelectedcadastro(cadastro);

    setMostraForm(true);

  };

  const handleSavecadastro = () => {

    // Escondendo o formulário e atualizando os cadastros 

    setMostraForm(false);

    fetchcadastros();

  };

  const handleCancelcadastro = () => {

    // Escondendo o formulário e limpando o cadastro selecionado 

    setMostraForm(false);

    setSelectedcadastro(null);

  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CRUD API com React Native</Text>
      {mostraForm ? (
        // Mostrando o formulário se o estado mostraForm for verdadeiro 
        <CadastroForm
          cadastro={selectedcadastro}
          onSave={handleSavecadastro}
          onCancel={handleCancelcadastro}
        />
      ) : (
        // Mostrando a lista de cadastros se o estado mostraForm for falso 
        <>
          <FlatList
            data={cadastros}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <CadastroItem
                cadastro={item}
                onDelete={handleDeletecadastro}
                onEdit={handleEditcadastro}
              />
            )}
          />
          <Button title="Adicionar cadastro" onPress={() => setMostraForm(true)} />
        </>
      )}
    </View>
  );
};

export default App;//tive que colocar essa linha 

// Definindo os estilos dos componentes 

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#E0FFFF',
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },

  CadastroItem: {
    flexDirection: 'column',
    alignItems: 'start',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#C0FFFF',
    borderRadius: 10,
  },

  CadastroId: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
  },

  CadastroCpf: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
  },

  CadastroNome: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
  },

  CadastroIdade: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
  },

  CadastroCep: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
  },

  CadastroEndereco: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
  },

  CadastroActions: {
    flexDirection: 'row',
    marginLeft: 10,
  },

  CadastroForm: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#C0FFFF',
    borderRadius: 10,
  },

  input: {
    height: 40,
    borderColor: '#00BFFF',
    borderWidth: 1,
    marginVertical: 5,
    paddingHorizontal: 10,
  },

  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },

}); 
