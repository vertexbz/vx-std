import atob from 'atob';

interface JWTHeaderType {
    alg: string;
    typ: string;
}

type JWTBodyType = {
    iat: number,
    exp: number,
    [key: string]: any
};

/**
 * Extracts header object from JWT string (no verification is performed)
 */
export const readHeader = (token: string): JWTHeaderType | undefined => {
    try {
        return JSON.parse(atob.call(null, token.split('.')[0]));
    } catch (e) {
        return undefined;
    }
};

/**
 * Extracts body object from JWT string (no verification is performed)
 */
export const readBody = (token: string): JWTBodyType | undefined => {
    try {
        return JSON.parse(atob.call(null, token.split('.')[1]));
    } catch (e) {
        return undefined;
    }
};
