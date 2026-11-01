import { config } from 'dotenv';

config();

const REQUIRED_VARIABLES = ['PORT', 'NODE_ENV'];

const missingVariables = REQUIRED_VARIABLES.filter(
    (variable) => !process.env[variable] || process.env[variable].trim() === '',
);

if (missingVariables.length > 0) {
    console.error(
        `Error de configuración: faltan las variables de entorno ${missingVariables.join(', ')}. ` +
        'Revisa tu archivo .env (puedes copiar .env.example como base).',
    );
    process.exit(1);
}

export const env = {
    PORT: Number(process.env.PORT),
    NODE_ENV: process.env.NODE_ENV,
};
