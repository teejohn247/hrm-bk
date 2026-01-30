import dotenv from 'dotenv';
import crypto from 'crypto';
import Employees from '../model/Employees';

dotenv.config();

const algorithm = 'aes-256-cbc';
const secretKey = process.env.ENCRYPTION_KEY;
const iv = crypto.randomBytes(16);

const encrypt = (text) => {
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    };
};

const encryptPaymentInfo = async () => {
    try {
        const employees = await Employees.find();

        for (const employee of employees) {
            if (employee.paymentInfo && !employee.paymentInfo.encrypted) {
                const encryptedInfo = encrypt(JSON.stringify(employee.paymentInfo));
                employee.paymentInfo = {
                    ...encryptedInfo,
                    encrypted: true
                };
                await employee.save();
            }
        }

        console.log('Payment information encryption completed');
    } catch (error) {
        console.error('Error encrypting payment information:', error);
    }
};

export default encryptPaymentInfo;

