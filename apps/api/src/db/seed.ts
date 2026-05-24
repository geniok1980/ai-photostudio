import { getDb, initDb } from './index';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

const seed = async () => {
  console.log('Initializing database schema...');
  initDb();
  const db = getDb();

  console.log('Seeding generation modes...');
  const insertMode = db.prepare(
    'INSERT OR IGNORE INTO generation_modes (id, name, display_name, description, icon, sort_order, is_active) VALUES ($id, $name, $display_name, $description, $icon, $sort_order, 1)'
  );

  const portraitModeId = uuidv4();
  const productModeId = uuidv4();

  insertMode.run({
    $id: portraitModeId,
    $name: 'portrait',
    $display_name: 'Портрет',
    $description: 'Загрузите своё фото и окажитесь в любом месте мира',
    $icon: '👤',
    $sort_order: 1,
  });
  insertMode.run({
    $id: productModeId,
    $name: 'product',
    $display_name: 'Товарная съёмка',
    $description: 'Создайте студийные фото товаров для маркетплейсов',
    $icon: '📦',
    $sort_order: 2,
  });

  console.log('Seeding concepts...');
  const insertConcept = db.prepare(
    'INSERT OR IGNORE INTO concepts (id, mode_id, name, display_name, description, prompt_template, sort_order, is_active) VALUES ($id, $mode_id, $name, $display_name, $description, $prompt_template, $sort_order, 1)'
  );

  // Portrait concepts (existing - location based)
  insertConcept.run({
    $id: uuidv4(),
    $mode_id: portraitModeId,
    $name: 'location',
    $display_name: 'Локация',
    $description: 'Перенестись в выбранное место',
    $prompt_template: '',
    $sort_order: 1,
  });

  // Product concepts
  insertConcept.run({
    $id: uuidv4(),
    $mode_id: productModeId,
    $name: 'catalog_shot',
    $display_name: 'Каталожный снимок',
    $description: 'Чистый белый фон, студийный свет — классика для маркетплейсов',
    $prompt_template: 'Product photography of {product_description}. Clean white background, studio lighting, professional catalog shot, high detail, sharp focus, commercial photography, 8K quality, centered composition, perfect lighting',
    $sort_order: 1,
  });
  insertConcept.run({
    $id: uuidv4(),
    $mode_id: productModeId,
    $name: 'on_model',
    $display_name: 'На модели',
    $description: 'Товар демонстрируется человеком — живо и естественно',
    $prompt_template: 'Product photography of {product_description}. Held by a person, lifestyle shot, natural lighting, realistic, professional e-commerce photo, model hands visible, clean background, commercial quality, natural skin tones',
    $sort_order: 2,
  });
  insertConcept.run({
    $id: uuidv4(),
    $mode_id: productModeId,
    $name: 'composition',
    $display_name: 'Композиция',
    $description: 'Художественная композиция с дополнительными предметами',
    $prompt_template: 'Artistic composition of {product_description} with complementary props, flat lay style, aesthetic arrangement, warm lighting, premium product photography, social media ready, professional styling, high detail',
    $sort_order: 3,
  });

  console.log('Seeding product categories...');
  const insertCategory = db.prepare(
    'INSERT OR IGNORE INTO product_categories (id, name, display_name, icon, sort_order, is_active) VALUES ($id, $name, $display_name, $icon, $sort_order, 1)'
  );

  const categories = [
    { name: 'jewelry', display_name: 'Ювелирка', icon: '💍', sort_order: 1 },
    { name: 'shoes', display_name: 'Обувь', icon: '👟', sort_order: 2 },
    { name: 'electronics', display_name: 'Электроника', icon: '📱', sort_order: 3 },
    { name: 'clothing', display_name: 'Одежда', icon: '👗', sort_order: 4 },
    { name: 'home_goods', display_name: 'Товары для дома', icon: '🏠', sort_order: 5 },
    { name: 'food_drinks', display_name: 'Еда и напитки', icon: '🍕', sort_order: 6 },
    { name: 'pet_supplies', display_name: 'Зоотовары', icon: '🐾', sort_order: 7 },
  ];

  for (const cat of categories) {
    insertCategory.run({
      $id: uuidv4(),
      $name: cat.name,
      $display_name: cat.display_name,
      $icon: cat.icon,
      $sort_order: cat.sort_order,
    });
  }

  console.log('Seeding infographic templates...');
  const insertTemplate = db.prepare(
    'INSERT OR IGNORE INTO infographic_templates (id, name, preview_url, config, is_active) VALUES ($id, $name, $preview_url, $config, 1)'
  );

  insertTemplate.run({
    $id: uuidv4(),
    $name: 'Variant 1',
    $preview_url: null,
    $config: JSON.stringify({
      elements: [
        { id: 'badge', type: 'badge', x: 20, y: 20, text: 'ХИТ', fontSize: 14, color: '#ff4444', width: 60, height: 28 },
        { id: 'title', type: 'text', x: 20, y: 500, text: 'Название товара', fontSize: 18, color: '#ffffff', width: 300, height: 30 },
        { id: 'price', type: 'text', x: 380, y: 500, text: '1 990 ₽', fontSize: 22, color: '#ff4444', width: 150, height: 30, bold: true },
        { id: 'features', type: 'list', x: 20, y: 540, text: '✓ Натуральный состав\n✓ Высокое качество', fontSize: 12, color: '#cccccc', width: 280, height: 50 },
      ],
      background: { color: '#1a1a2e' },
    }),
    $sort_order: 1,
  });

  insertTemplate.run({
    $id: uuidv4(),
    $name: 'Variant 2',
    $preview_url: null,
    $config: JSON.stringify({
      elements: [
        { id: 'title', type: 'text', x: 20, y: 460, text: 'Название товара', fontSize: 24, color: '#ffffff', width: 400, height: 40, bold: true },
        { id: 'description', type: 'text', x: 20, y: 500, text: 'Краткое описание товара', fontSize: 14, color: '#aaaaaa', width: 400, height: 24 },
        { id: 'price', type: 'text', x: 20, y: 540, text: '990 ₽', fontSize: 28, color: '#00ff88', width: 200, height: 36, bold: true },
        { id: 'badge_new', type: 'badge', x: 380, y: 20, text: 'NEW', fontSize: 12, color: '#00ff88', width: 60, height: 26 },
      ],
      background: { color: '#16213e' },
    }),
    $sort_order: 2,
  });

  insertTemplate.run({
    $id: uuidv4(),
    $name: 'Variant 3',
    $preview_url: null,
    $config: JSON.stringify({
      elements: [
        { id: 'title', type: 'text', x: 20, y: 480, text: 'ПРЕМИУМ', fontSize: 32, color: '#ffd700', width: 400, height: 50, bold: true },
        { id: 'subtitle', type: 'text', x: 20, y: 520, text: 'Название товара', fontSize: 16, color: '#ffffff', width: 400, height: 24 },
        { id: 'price', type: 'text', x: 350, y: 520, text: '2 490 ₽', fontSize: 20, color: '#ffd700', width: 150, height: 30, bold: true },
        { id: 'features', type: 'list', x: 20, y: 560, text: '✓ Премиум качество\n✓ Гарантия 2 года\n✓ Бесплатная доставка', fontSize: 12, color: '#dddddd', width: 350, height: 60 },
      ],
      background: { color: '#0a0a1a', gradient: true },
    }),
    $sort_order: 3,
  });

  console.log('Seeding locations...');
  const locations = [
    {
      id: uuidv4(),
      name: '🏖 Пляж на закате',
      description: 'Тропический пляж на закате с тёплым золотым светом',
      prompt: 'Transform this person to a tropical beach at sunset, warm golden light, ocean waves, palm trees, photorealistic, high quality',
      category: 'Природа',
      preview_url: null,
      sort_order: 1,
    },
    {
      id: uuidv4(),
      name: '🗽 Нью-Йорк Таймс-сквер',
      description: 'Таймс-сквер ночью, неоновые огни',
      prompt: 'Place this person in Times Square New York City at night, neon lights, busy streets, cinematic, high quality',
      category: 'Города',
      preview_url: null,
      sort_order: 2,
    },
    {
      id: uuidv4(),
      name: '🌌 Космос',
      description: 'Парение в открытом космосе с Землёй на фоне',
      prompt: 'Place this person floating in outer space, Earth in background, stars, nebula, sci-fi, cinematic',
      category: 'Фэнтези',
      preview_url: null,
      sort_order: 3,
    },
    {
      id: uuidv4(),
      name: '🏰 Средневековый замок',
      description: 'Большой зал средневекового замка с факелами',
      prompt: 'Place this person in a grand medieval castle hall, stone walls, torches, dramatic lighting',
      category: 'Фэнтези',
      preview_url: null,
      sort_order: 4,
    },
    {
      id: uuidv4(),
      name: '🌸 Японский сад',
      description: 'Традиционный японский сад с цветущей сакурой',
      prompt: 'Place this person in a traditional Japanese garden, cherry blossoms, pond, wooden bridge, serene',
      category: 'Природа',
      preview_url: null,
      sort_order: 5,
    },
    {
      id: uuidv4(),
      name: '🔮 Офис будущего',
      description: 'Футуристический офис с голографическими дисплеями',
      prompt: 'Place this person in a futuristic office, holographic displays, sleek design, blue lighting, cyberpunk',
      category: 'Города',
      preview_url: null,
      sort_order: 6,
    },
    {
      id: uuidv4(),
      name: '🏛 Древний Рим',
      description: 'Древний Рим с Колизеем на заднем плане',
      prompt: 'Place this person in ancient Rome, Colosseum background, togas, roman architecture, golden hour',
      category: 'Эпохи',
      preview_url: null,
      sort_order: 7,
    },
  ];

  const insertLocation = db.prepare(
    'INSERT OR IGNORE INTO locations (id, name, description, prompt, category, preview_url, sort_order, is_active) VALUES ($id, $name, $description, $prompt, $category, $preview_url, $sort_order, 1)'
  );

  for (const loc of locations) {
    insertLocation.run({
      $id: loc.id,
      $name: loc.name,
      $description: loc.description,
      $prompt: loc.prompt,
      $category: loc.category,
      $preview_url: loc.preview_url,
      $sort_order: loc.sort_order,
    });
  }

  console.log('Seeding packages...');
  const packages = [
    {
      id: uuidv4(),
      name: '🔹 Бесплатный',
      price: 0,
      generations_count: 2,
      sparks_count: 0,
      description: 'Попробуйте — 2 бесплатных генерации',
    },
    {
      id: uuidv4(),
      name: '🔸 Старт',
      price: 390,
      generations_count: 0,
      sparks_count: 50,
      description: '50 sparks — хватит на 12 изображений',
    },
    {
      id: uuidv4(),
      name: '🔸 Креатор',
      price: 990,
      generations_count: 0,
      sparks_count: 140,
      description: '140 sparks — хватит на 35 изображений',
    },
    {
      id: uuidv4(),
      name: '🔸 Студия',
      price: 2490,
      generations_count: 0,
      sparks_count: 400,
      description: '400 sparks — хватит на 100 изображений (выбор 67% пользователей)',
    },
    {
      id: uuidv4(),
      name: '🔸 Бизнес',
      price: 6490,
      generations_count: 0,
      sparks_count: 1200,
      description: '1200 sparks — хватит на 300 изображений',
    },
  ];

  const insertPackage = db.prepare(
    'INSERT OR IGNORE INTO packages (id, name, price, generations_count, sparks_count, description, is_active) VALUES ($id, $name, $price, $generations_count, $sparks_count, $description, 1)'
  );

  for (const pkg of packages) {
    insertPackage.run({
      $id: pkg.id,
      $name: pkg.name,
      $price: pkg.price,
      $generations_count: pkg.generations_count,
      $sparks_count: pkg.sparks_count,
      $description: pkg.description,
    });
  }

  console.log('Seeding admin user...');
  const adminEmail = 'admin@photostudio.app';
  const existingAdmin = db.query('SELECT * FROM users WHERE email = $email').get({ $email: adminEmail });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    db.prepare(
      `INSERT INTO users (id, email, password_hash, name, role, free_attempts_used, balance_generations, spark_balance)
       VALUES ($id, $email, $password_hash, $name, $role, $free_attempts_used, $balance_generations, $spark_balance)`
    ).run({
      $id: uuidv4(),
      $email: adminEmail,
      $password_hash: passwordHash,
      $name: 'Администратор',
      $role: 'admin',
      $free_attempts_used: 0,
      $balance_generations: 999,
      $spark_balance: 9999,
    });
    console.log('Admin user created (admin@photostudio.app / admin123)');
  } else {
    console.log('Admin user already exists');
  }

  console.log('Database seeding complete!');
};

seed().catch(console.error);
