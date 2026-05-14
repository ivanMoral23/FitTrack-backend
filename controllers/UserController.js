import UserModel from "../models/userModel.js";
import { validateUser, validateLogin } from "../schemas/userValidation.js";
import jwt from 'jsonwebtoken';
import { EmailService } from "../services/EmailService.js";

export class UserController {

    static async getAllUsers(req, res) {
        try {
            const users = await UserModel.getAll();
            return res.status(200).json({ message: "Usuarios obtenidos:", users });
        } catch (error) {
            res.status(500).json({ message: "Error al obtener los usuarios", error: error.message });
        }
    }

    static async getUserById(req, res) {
        try {
            const user = await UserModel.getById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }
            return res.status(200).json({ message: "Usuario obtenido:", user });
        } catch (error) {
            res.status(500).json({ message: "Error al obtener el usuario", error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const result = await validateUser(req.body);
            if(result.error) {
                return res.status(400).json({ message: "Datos de usuario no válidos", error: result.error.errors });
            }
            const newUser = await UserModel.create({
                username: result.data.username,
                email: result.data.email,
                password: result.data.password,
                weight: result.data.weight || 0,
                height: result.data.height || 0,
                age: result.data.age || 0
            });

            // Generar token para verificación
            const verificationToken = jwt.sign({ id: newUser._id }, process.env.SECRET_JWT_KEY, { expiresIn: '1h' });
            
            // Enviar email de forma asíncrona sin bloquear la respuesta de la api
            EmailService.sendVerificationEmail(newUser.email, verificationToken)
                .catch(err => console.error("Fallo al enviar correo de verificación:", err));

            return res.status(201).json({ message: "Usuario creado con éxito. Revisa tu bandeja de correo para verificar el email antes de iniciar sesión.", user: newUser });
        } catch (error) {
            res.status(500).json({ message: "Error al crear el usuario", error: error.message });
        }
    }

    static async updateUser(req, res) {
        console.log(`DEBUG: [UserController] Petición de actualización para ID: ${req.params.id}`);
        console.log(`DEBUG: [UserController] Body recibido: ${JSON.stringify(req.body)}`);
        try {
            const result = await validateUser(req.body);
            if(result.error) {
                console.error(`DEBUG: [UserController] Error de validación Zod:`, result.error.errors);
                return res.status(400).json({ message: "Datos de usuario no válidos", error: result.error.errors });
            }
            console.log(`DEBUG: [UserController] Datos validados con éxito:`, result.data);
            const userId = req.user?.id || req.params.id;
            const updatedUser = await UserModel.updateById(
                userId,
                {
                    username: result.data.username,
                    email: result.data.email,
                    password: result.data.password,
                    weight: result.data.weight,
                    height: result.data.height,
                    age: result.data.age
                }
            );
            if (!updatedUser) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }
            return res.status(200).json({ message: "Usuario actualizado!", user: updatedUser });
        } catch (error) {
            res.status(500).json({ message: "Error al actualizar el usuario", error: error.message });
        }
    }

    static async deleteUser(req, res) {
        try {
            const deletedUser = await UserModel.deleteById(req.params.id);
            if (!deletedUser) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }
            return res.status(200).json({ message: "Usuario eliminado!", user: deletedUser });
        } catch (error) {
            res.status(500).json({ message: "Error al eliminar el usuario", error: error.message });
        }
    }

    static async login(req, res) {
        try {
            const result = await validateLogin(req.body);
            if(result.error) {
                return res.status(400).json({ message: "Datos de usuario no válidos", error: result.error.errors });
            }
            const userLogin = await UserModel.login({
                username: result.data.username,
                password: result.data.password
            });
            if (!userLogin) {
                return res.status(401).json({ message: "Credenciales incorrectas" });
            }
            const token = jwt.sign({ id: userLogin._id }, process.env.SECRET_JWT_KEY);
            return res.status(200).json({ message: "Usuario autenticado!", user: userLogin, token });
        } catch (error) {
            // Le pasamos el error.message directo a 'message' para que el SnackBar de Flutter lo imprima con exactitud.
            res.status(401).json({ message: error.message });
        }
    }

    static async verifyEmail(req, res) {
        try {
            const token = req.params.token;
            if (!token) return res.status(400).send("<h1>Error</h1><p>Token no proporcionado.</p>");

            const decoded = jwt.verify(token, process.env.SECRET_JWT_KEY);
            const user = await UserModel.updateById(decoded.id, { isVerified: true });

            if (!user) return res.status(404).send("<h1>Error</h1><p>Usuario no válido o ya no existe.</p>");

            return res.status(200).send("<html><body style='font-family: Arial, sans-serif; text-align: center; margin-top: 50px;'><h1 style='color: #28a745;'>¡Verificación Exitosa!</h1><p>Tu correo ha sido confirmado. Ya puedes volver a la App de GymTracker y hacer Login.</p></body></html>");
        } catch (error) {
            return res.status(400).send("<html><body style='font-family: Arial, sans-serif; text-align: center; margin-top: 50px;'><h1 style='color: #dc3545;'>Error de Verificación</h1><p>El enlace ha expirado o es inválido.</p></body></html>");
        }
    }

    static async requestPasswordReset(req, res) {
        try {
            const { email } = req.body;
            if (!email) return res.status(400).json({ message: "Se requiere el email" });

            const user = await UserModel.User.findOne({ email });
            if (!user) {
                // Por seguridad, siempre decimos que se envió el correo para evitar descubrimiento de correos ajenos
                return res.status(200).json({ message: "Si el correo existe, se le enviará un enlace de recuperación." });
            }

            const resetToken = jwt.sign({ id: user._id }, process.env.SECRET_JWT_KEY, { expiresIn: '15m' });
            
            EmailService.sendPasswordResetEmail(user.email, resetToken)
                .catch(err => console.error("Fallo al enviar correo de recuperación:", err));

            return res.status(200).json({ message: "Si el correo existe, se le enviará un enlace de recuperación." });
        } catch (error) {
            res.status(500).json({ message: "Error procesando recuperación", error: error.message });
        }
    }

    static async showResetPasswordForm(req, res) {
        try {
            const token = req.params.token;
            if (!token) return res.status(400).send("<h1>Error</h1><p>Token no proporcionado.</p>");

            // Validamos que no esté caducado antes de enseñar el formulario
            jwt.verify(token, process.env.SECRET_JWT_KEY);
            
            const html = `
            <html>
            <body style='font-family: Arial, sans-serif; text-align: center; margin-top: 50px; background-color: #f4f4f9;'>
                <h2 style='color: #333;'>Restablecer Contraseña</h2>
                <form action="/auth/reset-password" method="POST" style="background: white; padding: 20px; border-radius: 8px; display: inline-block; box-shadow: 0px 4px 6px rgba(0,0,0,0.1);">
                    <input type="hidden" name="token" value="${token}" />
                    <input type="password" name="newPassword" placeholder="Nueva Contraseña" required minlength="6" style="padding: 10px; width: 100%; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 15px;" />
                    <br/>
                    <button type="submit" style="padding: 10px 20px; background-color: #dc3545; color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; width: 100%;">Guardar Contraseña</button>
                </form>
            </body>
            </html>
            `;
            return res.status(200).send(html);
        } catch (error) {
            return res.status(400).send("<html><body style='font-family: Arial, sans-serif; text-align: center; margin-top: 50px;'><h1 style='color: #dc3545;'>Error</h1><p>El enlace ha expirado o es inválido.</p></body></html>");
        }
    }

    static async updatePassword(req, res) {
        try {
            // Este endpoint recibe los datos del formulario HTML
            const { token, newPassword } = req.body;
            if (!token || !newPassword) return res.status(400).send("<h1>Error</h1><p>Faltan datos</p>");

            const decoded = jwt.verify(token, process.env.SECRET_JWT_KEY);
            
            // Actualizamos. Recordamos que updateById tiene la lógica de bcrypt implementada
            await UserModel.updateById(decoded.id, { password: newPassword });

            return res.status(200).send("<html><body style='font-family: Arial, sans-serif; text-align: center; margin-top: 50px;'><h1 style='color: #28a745;'>¡Contraseña Cambiada!</h1><p>Ya puedes volver a la App con tu nueva clave.</p></body></html>");
        } catch (error) {
            return res.status(400).send("<html><body style='font-family: Arial, sans-serif; text-align: center; margin-top: 50px;'><h1 style='color: #dc3545;'>Error</h1><p>El enlace ha expirado o es inválido.</p></body></html>");
        }
    }

    static async changePassword(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) return res.status(401).json({ message: 'No autenticado' });

            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                return res.status(400).json({ message: 'Se requieren la contraseña actual y la nueva' });
            }
            if (newPassword.length < 6) {
                return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' });
            }

            const user = await UserModel.User.findById(userId);
            if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

            const passwordMatch = await bcrypt.compare(currentPassword, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ message: 'La contraseña actual es incorrecta' });
            }

            await UserModel.updateById(userId, { password: newPassword });
            return res.status(200).json({ message: 'Contraseña actualizada correctamente' });
        } catch (error) {
            res.status(500).json({ message: 'Error al cambiar la contraseña', error: error.message });
        }
    }
}