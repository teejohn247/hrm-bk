import dotenv from 'dotenv';

dotenv.config();

/** Public web app origin (no trailing slash). Set FRONTEND_URL in .env / Render. */
export function getFrontendBaseUrl() {
    const base = process.env.FRONTEND_URL || 'http://localhost:3000';
    return base.replace(/\/$/, '');
}

export function frontendPath(path) {
    const segment = path.startsWith('/') ? path : `/${path}`;
    return `${getFrontendBaseUrl()}${segment}`;
}

export function signUpRegistrationUrl(token) {
    return frontendPath(`/app/${token}`);
}

export function setPasswordUrl(token) {
    return frontendPath(`/set-password/${token}`);
}
