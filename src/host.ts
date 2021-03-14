type RequestedSchemaType = 'http' | 'ws';

// @ts-ignore
const getCurrentUrl = () => new URL(window ? window.location.href : '');

/**
 *
 */
// eslint-disable-next-line complexity
export const createHost = (schema: RequestedSchemaType = 'http', prefix?: string): string => {
    const location = getCurrentUrl();

    const secure = ['https:', 'wss:', 'https', 'wss'].includes(location.protocol);

    let host = location.hostname;
    if (prefix) {
        host = host.replace('www.', '');
    }

    let port = parseInt(location.port);
    // eslint-disable-next-line eqeqeq
    if (port && ((secure && port == 443) || (!secure && port == 80))) {
        port = 0;
    }

    return [
        schema,
        secure ? 's' : '',
        '://',
        prefix ? `${prefix}.` : '',
        host,
        port ? `:${port}` : ''
    ].join('');
};

/**
 *
 * @param host
 */
export const stripPort = (host: string): string => {
    host = host.split('//').pop() || host;
    return host.split(':').shift() || host;
};
