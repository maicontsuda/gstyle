const express = require('express');
const router = express.Router();
const ZeroKmCar = require('../models/ZeroKmCar');
const authMiddleware = require('../middleware/auth');

// @route  GET /api/zerokm/marcas
// Lista todas as marcas distintas agrupadas por origem
router.get('/marcas', async (req, res) => {
  try {
    const cars = await ZeroKmCar.find({}, 'brand origin').lean();
    
    // Agrupar por origem (Japonesa vs Importada) e filtrar marcas únicas
    const marcasMap = { Japonesa: new Set(), Importada: new Set() };
    
    cars.forEach(car => {
      if (car.origin && marcasMap[car.origin]) {
        marcasMap[car.origin].add(car.brand);
      }
    });

    res.json({
      Japonesa: Array.from(marcasMap.Japonesa).sort(),
      Importada: Array.from(marcasMap.Importada).sort()
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar marcas.' });
  }
});

// @route  GET /api/zerokm
// Lista carros 0KM com filtros e ordenação dinâmicos
router.get('/', async (req, res) => {
  try {
    const { 
      brand, 
      model, 
      category, 
      fuel_type, 
      transmission, 
      color,
      minPrice, 
      maxPrice, 
      year,
      sort, // asc_price, desc_price, newest, oldest, az, popular
      page = 1, 
      limit = 12 
    } = req.query;

    const filtro = { is_new: true };

    if (brand)        filtro.brand        = new RegExp(`^${brand}$`, 'i'); // Exata (case-insensitive)
    if (model)        filtro.model        = new RegExp(model, 'i'); // Contains
    if (category)     filtro.category     = category;
    if (fuel_type)    filtro.fuel_type    = fuel_type;
    if (transmission) filtro.transmission = transmission;
    if (color)        filtro.colors_available = { $in: [new RegExp(color, 'i')] };
    if (year)         filtro.year         = Number(year);

    if (minPrice || maxPrice) {
      filtro.price = {};
      if (minPrice) filtro.price.$gte = Number(minPrice);
      if (maxPrice) filtro.price.$lte = Number(maxPrice);
    }

    // Configuração do Sort
    let sortOptions = { popularity_score: -1, createdAt: -1 }; // Default
    if (sort === 'asc_price')  sortOptions = { price: 1 };
    if (sort === 'desc_price') sortOptions = { price: -1 };
    if (sort === 'newest')     sortOptions = { year: -1, launch_date: -1 };
    if (sort === 'oldest')     sortOptions = { year: 1, launch_date: 1 };
    if (sort === 'az')         sortOptions = { model: 1 };

    const skip = (Number(page) - 1) * Number(limit);
    
    const [carros, total] = await Promise.all([
      ZeroKmCar.find(filtro).sort(sortOptions).skip(skip).limit(Number(limit)),
      ZeroKmCar.countDocuments(filtro)
    ]);

    res.json({ 
      carros, 
      total, 
      paginas: Math.ceil(total / Number(limit)), 
      paginaAtual: Number(page) 
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar veículos 0KM.' });
  }
});

// @route  GET /api/zerokm/:id
router.get('/:id', async (req, res) => {
  try {
    const carro = await ZeroKmCar.findById(req.params.id);
    if (!carro) return res.status(404).json({ error: 'Veículo 0KM não encontrado.' });
    res.json(carro);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar veículo 0KM.' });
  }
});

// @route  POST /api/zerokm  (admin)
// Adicionar modelo 0KM manualmente
router.post('/', authMiddleware, async (req, res) => {
  try {
    const carro = new ZeroKmCar(req.body);
    await carro.save();
    res.status(201).json(carro);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
