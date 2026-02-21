// Función helper para convertir BigInt a Number y Date a string ISO recursivamente
const convertBigIntToNumber = (obj) => {
    if (obj === null || obj === undefined) {
        return obj;
    }
    
    if (typeof obj === 'bigint') {
        return Number(obj);
    }
    
    if (obj instanceof Date) {
        return obj.toISOString();
    }
    
    if (Array.isArray(obj)) {
        return obj.map(convertBigIntToNumber);
    }
    
    if (typeof obj === 'object') {
        const converted = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                converted[key] = convertBigIntToNumber(obj[key]);
            }
        }
        return converted;
    }
    
    return obj;
};

// Utilidad para manejar respuestas consistentes
export const sendResponse = (res, statusCode, success, message, data = null, errors = null) => {
    const response = {
        success,
        message
    };

    if (data !== null) {
        response.data = convertBigIntToNumber(data);
    }

    if (errors !== null) {
        response.errors = convertBigIntToNumber(errors);
    }

    return res.status(statusCode).json(response);
};

export const sendSuccess = (res, message, data = null, statusCode = 200) => {
    return sendResponse(res, statusCode, true, message, data);
};

export const sendError = (res, message, errors = null, statusCode = 400) => {
    return sendResponse(res, statusCode, false, message, null, errors);
};


