import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const auth = (req, res, next) => {
  // eslint-disable-next-line linebreak-style

  try {
    const header = req.headers.authorization;

    console.log({header})
    if (!header || header === '') return res.status(401).json({ status: 401, error: 'Unauthorized' });

    const options = { expiresIn: '1000d' };

    req.payload = jwt.verify(header, process.env.SECRET_KEY, options);
    next();
  } catch (error) {
    return res.status(401).json({ status: 401, error: 'Invalid token!' });
  }

  return false;
};

export default auth;
