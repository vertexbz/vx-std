// @flow
import atob from 'atob';

type JWTHeaderType = {

};

type JWTBodyType = {
    iat: number,
    exp: number,
    [key: string]: any
};

/**
 * Extracts header object from JWT string (no verification is performed)
 */
export const readHeader = (token: string): JWTHeaderType => JSON.parse(atob(token.split('.')[0]));

/**
 * Extracts body object from JWT string (no verification is performed)
 */
export const readBody = (token: string): JWTBodyType => JSON.parse(atob(token.split('.')[1]));
