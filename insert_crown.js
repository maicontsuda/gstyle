require('dotenv').config();
const mongoose = require('mongoose');
const Carro = require('./src/models/Carro');

async function insertCar() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB Conectado.');

  const equipamentos = [
    'Ar Condicionado',
    'Vidros Elétricos',
    'Direção Hidráulica',
    'Bancos Elétricos',
    'Aquecimento de Bancos',
    'Chave Presencial',
    'Freios ABS',
    'Controle de Estabilidade',
    'Controle de Tração',
    'Airbag',
    'Navegação GPS',
    'Bluetooth',
    'TV',
    'DVD player',
    'USB',
    'Faróis HID (xenon)',
    'Faróis de Neblina',
    'DRL (luz diurna)',
    'Sistema de áudio premium',
    'Sistema anti-furto',
    'Auto light'
  ];

  const novoCarro = new Carro({
    marca: 'Toyota',
    modelo: 'Crown Athlete', // Using exact model name requested
    ano: 2015,
    cor: 'Branco Pérola',
    status: 'semi_novo',
    tipo: 'sedan',
    valor: 2980000,
    km: 14000,
    shakenVencimento: '2027', 
    combustivel: 'gasolina',
    cambio: 'automatico',
    potencia: '315 PS (232 kW)',
    cilindradas: 3500,
    portas: 4,
    lotacao: 5,
    tracao: '2WD (traseira)',
    historicoReparo: false,
    equipamentos: equipamentos,
    descricao: 'Toyota Crown Athlete G 2015 em excelente estado, com baixíssima quilometragem.',
    garantia: 'Garantia incluída',
    observacoes: `Versão: Athlete G
Ano japonês: Heisei 27
Preço: 2.980.000 ienes (~¥298万)
Entrada estimada: 100.000 ienes
Financiamento exemplo: ¥20.300 / mês (Taxa: 3.9%)
Rodagem: extremamente baixa para um carro de 2015.
Motor: V6, Torque: 38.4 kgfm, Sistema: DOHC
Consumo médio: 9.6 km/L
Rodas: Alumínio 18 polegadas
Dimensões: Comprimento 4895 mm, Largura 1800 mm, Altura 1450 mm, Peso 1650 kg
Avaliação externa: ⭐ 5/5 (Exterior praticamente perfeito)
Avaliação interna: ⭐ 4/5 (Interior com pequenos sinais de uso)
Diagnóstico mecânico: Verificado motor, transmissão, freios e suspensão. Nenhum problema relatado.`
  });

  const carroSalvo = await novoCarro.save();
  console.log('Carro Crown Athlete adicionado com sucesso! ID:', carroSalvo._id);
  process.exit(0);
}

insertCar().catch(err => {
  console.error('Erro ao inserir carro:', err);
  process.exit(1);
});
