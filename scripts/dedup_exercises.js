import 'dotenv/config';
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI no definida');
  process.exit(1);
}

await mongoose.connect(MONGO_URI);
console.log('MongoDB conectado');

const Exercice = mongoose.models.Exercice || mongoose.model('Exercice', new mongoose.Schema({}, { strict: false }));

// Agrupa por nombre (case-insensitive) y userId null (ejercicios globales)
const docs = await Exercice.find({ userId: null }).lean();

// Agrupa por nombre normalizado
const groups = {};
for (const doc of docs) {
  const key = doc.name.trim().toLowerCase();
  if (!groups[key]) groups[key] = [];
  groups[key].push(doc);
}

// Encuentra duplicados: más de 1 doc con el mismo nombre
const toDelete = [];
for (const [name, group] of Object.entries(groups)) {
  if (group.length > 1) {
    // Ordenar por _id ascendente (el más antiguo primero) y eliminar el resto
    group.sort((a, b) => a._id.toString().localeCompare(b._id.toString()));
    const duplicates = group.slice(1); // mantiene el primero, borra los demás
    toDelete.push(...duplicates.map(d => d._id));
    console.log(`Duplicado encontrado: "${group[0].name}" — manteniendo 1, eliminando ${duplicates.length}`);
  }
}

if (toDelete.length === 0) {
  console.log('No se encontraron duplicados.');
} else {
  const result = await Exercice.deleteMany({ _id: { $in: toDelete } });
  console.log(`✓ Eliminados ${result.deletedCount} ejercicios duplicados.`);
}

await mongoose.disconnect();
