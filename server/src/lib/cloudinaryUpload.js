import crypto from 'crypto';

function parseCloudinaryUrl() {
    const url = process.env.CLOUDINARY_URL;
    if (!url) {
        throw new Error('CLOUDINARY_URL no configurada');
    }

    const match = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (!match) {
        throw new Error('CLOUDINARY_URL inválida (formato cloudinary://key:secret@cloud_name)');
    }

    return {
        apiKey: match[1],
        apiSecret: match[2],
        cloudName: match[3],
    };
}

export function isCloudinaryUploadEnabled() {
    return process.env.UPLOAD_PROVIDER === 'cloudinary';
}

export async function uploadBufferToCloudinary(buffer, originalName) {
    const { apiKey, apiSecret, cloudName } = parseCloudinaryUrl();
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = process.env.CLOUDINARY_FOLDER || 'sistema-soporte/tickets';

    const stringToSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = crypto.createHash('sha1').update(stringToSign + apiSecret).digest('hex');

    const form = new FormData();
    form.append('file', new Blob([buffer]), originalName);
    form.append('api_key', apiKey);
    form.append('timestamp', String(timestamp));
    form.append('signature', signature);
    form.append('folder', folder);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: form }
    );

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`Cloudinary upload ${response.status}: ${body}`);
    }

    const data = await response.json();
    return data.secure_url;
}
