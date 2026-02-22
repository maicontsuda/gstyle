require('dotenv').config();
const mongoose = require('mongoose');
const Carro = require('./src/models/Carro');
const Servico = require('./src/models/Servico');

// Ensure db URL is available
const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gstyle-motors';

const carrosMock = [
  {
    marca: 'Porsche',
    modelo: '911 Carrera S',
    ano: 2024,
    km: 0,
    cor: 'Preto Metálico',
    valor: 1150000,
    status: 'zero_km',
    tipo: 'esportivo',
    combustivel: 'gasolina',
    cambio: 'automatico',
    potencia: '450 cv',
    destaque: true,
    descricao: 'Design atemporal e performance incomparável. O 911 Carrera S entrega a verdadeira essência da pilotagem esportiva premium.',
    imagens: [
      'https://images.unsplash.com/photo-1503376712351-1c436d400262?w=800&q=80',
      'https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800&q=80'
    ]
  },
  {
    marca: 'Range Rover',
    modelo: 'Sport HSE',
    ano: 2023,
    km: 15400,
    cor: 'Branco Pérola',
    valor: 890000,
    status: 'semi_novo',
    tipo: 'suv',
    combustivel: 'diesel',
    cambio: 'automatico',
    potencia: '300 cv',
    destaque: true,
    descricao: 'O autêntico SUV de luxo britânico. Conforto absoluto, tecnologia avançada e capacidade off-road, perfeito para famílias exigentes.',
    imagens: [
      'https://images.unsplash.com/photo-1620616155543-ec522a44b360?w=800&q=80',
      'https://images.unsplash.com/photo-1582639510494-c80b5ea9e0ef?w=800&q=80'
    ]
  },
  {
    marca: 'BMW',
    modelo: 'M3 Competition',
    ano: 2024,
    km: 0,
    cor: 'Amarelo São Paulo',
    valor: 920000,
    status: 'zero_km',
    tipo: 'sedan',
    combustivel: 'gasolina',
    cambio: 'automatico',
    potencia: '510 cv',
    destaque: true,
    descricao: 'A pura adrenalina da linha M. Motor 6 cilindros biturbo e dinâmica fenomenal para as pistas ou para o dia a dia.',
    imagens: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
      'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=800&q=80'
    ]
  },
  {
    marca: 'Audi',
    modelo: 'RS e-tron GT',
    ano: 2023,
    km: 8000,
    cor: 'Cinza Daytona',
    valor: 850000,
    status: 'semi_novo',
    tipo: 'esportivo',
    combustivel: 'eletrico',
    cambio: 'automatico',
    potencia: '646 cv',
    destaque: false,
    descricao: 'O futuro da performance. Grand tourer 100% elétrico unindo design esculpido, zero emissões e silêncio absoluto.',
    imagens: [
      'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800&q=80',
      'https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?w=800&q=80'
    ]
  },
  {
    marca: 'Mercedes-Benz',
    modelo: 'G63 AMG',
    ano: 2022,
    km: 22000,
    cor: 'Preto',
    valor: 1850000,
    status: 'semi_novo',
    tipo: 'suv',
    combustivel: 'gasolina',
    cambio: 'automatico',
    potencia: '585 cv',
    destaque: false,
    descricao: 'O icônico utilitário de luxo da Mercedes-Benz na sua versão mais brutal, com motor V8 biturbo preparado pela AMG.',
    imagens: [
      'https://images.unsplash.com/photo-1520031441872-265e4ff70366?w=800&q=80',
      'https://images.unsplash.com/photo-1606016159991-d17f65320c11?w=800&q=80'
    ]
  },
  {
    marca: 'Volvo',
    modelo: 'XC90 Recharge',
    ano: 2024,
    km: 0,
    cor: 'Prata',
    valor: 580000,
    status: 'zero_km',
    tipo: 'suv',
    combustivel: 'hibrido',
    cambio: 'automatico',
    potencia: '462 cv',
    destaque: false,
    descricao: 'O pináculo do luxo sueco. Propulsão híbrida plug-in, 7 lugares e os sistemas de segurança mais avançados do mercado.',
    imagens: [
      'https://images.unsplash.com/photo-1623194002626-d68b753a479b?w=800&q=80',
      'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800&q=80'
    ]
  },
];

const servicosMock = [
  { nome: 'Revisão Completa', descricao: 'Verificação total do veículo com laudo técnico detalhado.', icone: '🔧', preco: 1500 },
  { nome: 'Financiamento', descricao: 'Simule e aprove seu financiamento com as melhores taxas do mercado.', icone: '💳', preco: 0 },
  { nome: 'Troca / Avaliação', descricao: 'Traga seu veículo e receba uma avaliação justa na hora.', icone: '🔄', preco: 0 },
  { nome: 'Garantia Estendida', descricao: 'Proteção completa pós-compra para sua tranquilidade.', icone: '🛡️', preco: 5000 },
  { nome: 'Test Drive Premium', descricao: 'Agende um test drive e sinta a experiência antes de comprar.', icone: '🚗', preco: 0 },
  { nome: 'Despachante VIP', descricao: 'Nossa equipe cuida de toda a burocracia documental para você.', icone: '📋', preco: 1200 },
];

async function seedDB() {
  try {
    console.log(`🔌 Conectando ao MongoDB em ${dbURI}...`);
    await mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Conectado ao MongoDB.');

    console.log('🗑️ Limpando a base de dados (Carros e Serviços)...');
    await Carro.deleteMany({});
    await Servico.deleteMany({});
    console.log('🧹 Base limpa.');

    console.log('🌱 Inserindo veículos mockados...');
    await Carro.insertMany(carrosMock);
    console.log(`✅ ${carrosMock.length} veículos inseridos.`);

    console.log('🌱 Inserindo serviços mockados...');
    await Servico.insertMany(servicosMock);
    console.log(`✅ ${servicosMock.length} serviços inseridos.`);

    console.log('✨ Seed finalizado com sucesso!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro no seed:', err);
    process.exit(1);
  }
}

seedDB();
