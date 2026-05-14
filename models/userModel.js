import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Definimos el schema y el modelo con Mongoose
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    weight: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    age: { type: Number, default: 0 },
}, { timestamps: true });

// al hacer this.User tenemos muchas funcionalidades de mongoose -> Mirar doc mongoose para verlas (.create, .find...).
const User = mongoose.models.User || mongoose.model('User', userSchema);

export class UserModel {
  
    constructor() {
      this.User = User;
    }

    async getAll() {
      return this.User.find({});
    }

    async getById(id) {
      return this.User.findById(id);
    }

    async create({ username, email, password, weight, height, age }) {
      const hashedPassword = await bcrypt.hash(password, 10); // Salt de 10 rounds (no pongo menos que luego se me olvida quitarlo)
      return this.User.create({ username, email, password: hashedPassword, weight, height, age });
    }

    async updateById(id, data) {
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }
      return this.User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }

    async deleteById(id) {
      return this.User.findByIdAndDelete(id);
    }

    async login({username, password}) {
      // Búsqueda inteligente: permite que el usuario meta su email O su username en el mismo input
      const user = await this.User.findOne({ 
        $or: [
          { username: username }, 
          { email: username }
        ] 
      });
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      if (!user.isVerified) {
        throw new Error('Debes verificar tu email antes de entrar. Revisa tu correo electrónico.');
      }
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        throw new Error('Contraseña incorrecta');
      }
      return user;
    }
}
export default new UserModel();
