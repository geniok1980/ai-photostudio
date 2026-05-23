import { getDb, initDb } from './index';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

const seed = async () => {
  console.log('Initializing database schema...');
  initDb();
  const db = getDb();

  console.log('Seeding locations...');
  const locations = [
    {
      id: uuidv4(),
      name: 'Beach at Sunset',
      description: 'Tropical beach at sunset with warm golden light',
      prompt: 'Transform this person to a tropical beach at sunset, warm golden light, ocean waves, palm trees, photorealistic, high quality',
      category: 'Nature',
      preview_url: null,
      sort_order: 1,
    },
    {
      id: uuidv4(),
      name: 'NYC Times Square',
      description: 'Times Square New York City at night with neon lights',
      prompt: 'Place this person in Times Square New York City at night, neon lights, busy streets, cinematic, high quality',
      category: 'Cities',
      preview_url: null,
      sort_order: 2,
    },
    {
      id: uuidv4(),
      name: 'Outer Space',
      description: 'Floating in outer space with Earth in the background',
      prompt: 'Place this person floating in outer space, Earth in background, stars, nebula, sci-fi, cinematic',
      category: 'Fantasy',
      preview_url: null,
      sort_order: 3,
    },
    {
      id: uuidv4(),
      name: 'Medieval Castle',
      description: 'Grand medieval castle hall with dramatic lighting',
      prompt: 'Place this person in a grand medieval castle hall, stone walls, torches, dramatic lighting',
      category: 'Fantasy',
      preview_url: null,
      sort_order: 4,
    },
    {
      id: uuidv4(),
      name: 'Japanese Garden',
      description: 'Traditional Japanese garden with cherry blossoms',
      prompt: 'Place this person in a traditional Japanese garden, cherry blossoms, pond, wooden bridge, serene',
      category: 'Nature',
      preview_url: null,
      sort_order: 5,
    },
    {
      id: uuidv4(),
      name: 'Futuristic Office',
      description: 'Futuristic office with holographic displays',
      prompt: 'Place this person in a futuristic office, holographic displays, sleek design, blue lighting, cyberpunk',
      category: 'Cities',
      preview_url: null,
      sort_order: 6,
    },
    {
      id: uuidv4(),
      name: 'Ancient Rome',
      description: 'Ancient Rome with Colosseum in the background',
      prompt: 'Place this person in ancient Rome, Colosseum background, togas, roman architecture, golden hour',
      category: 'Eras',
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
      name: 'Free',
      price: 0,
      generations_count: 2,
      description: 'Try it out — 2 free generations',
    },
    {
      id: uuidv4(),
      name: 'Starter',
      price: 299,
      generations_count: 10,
      description: '10 generations for everyday use',
    },
    {
      id: uuidv4(),
      name: 'Optimal',
      price: 599,
      generations_count: 30,
      description: '30 generations — best value',
    },
    {
      id: uuidv4(),
      name: 'PRO',
      price: 1499,
      generations_count: 100,
      description: '100 generations for heavy usage',
    },
  ];

  const insertPackage = db.prepare(
    'INSERT OR IGNORE INTO packages (id, name, price, generations_count, description, is_active) VALUES ($id, $name, $price, $generations_count, $description, 1)'
  );

  for (const pkg of packages) {
    insertPackage.run({
      $id: pkg.id,
      $name: pkg.name,
      $price: pkg.price,
      $generations_count: pkg.generations_count,
      $description: pkg.description,
    });
  }

  console.log('Seeding admin user...');
  const adminEmail = 'admin@photostudio.app';
  const existingAdmin = db.query('SELECT * FROM users WHERE email = $email').get({ $email: adminEmail });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    db.prepare(
      `INSERT INTO users (id, email, password_hash, name, role, free_attempts_used, balance_generations)
       VALUES ($id, $email, $password_hash, $name, $role, $free_attempts_used, $balance_generations)`
    ).run({
      $id: uuidv4(),
      $email: adminEmail,
      $password_hash: passwordHash,
      $name: 'Admin User',
      $role: 'admin',
      $free_attempts_used: 0,
      $balance_generations: 999,
    });
    console.log('Admin user created (admin@photostudio.app / admin123)');
  } else {
    console.log('Admin user already exists');
  }

  console.log('Database seeding complete!');
};

seed().catch(console.error);
