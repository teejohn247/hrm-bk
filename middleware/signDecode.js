import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const signDecode = (req, res, next) => {
  // eslint-disable-next-line linebreak-style

  try {

    let header = req.body.token || req.headers.authorization;

    if (!header || header === '') return res.status(401).json({ status: 401, error: 'Unauthorized' });

    if (header.startsWith('Bearer ')) {
      header = header.slice(7).trim();
    } else {
      header = header.trim();
    }

    const options = { expiresIn: '1000d' };

    req.decode = jwt.verify(header, process.env.SECRET_KEY, options);


    next();
  } catch (error) {
    return res.status(401).json({ status: 401, error: 'Invalid token!' });
  }

  return false;
};

export default signDecode;
