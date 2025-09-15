import jwt from 'jsonwebtoken';
import config from '../../../config';
import MongoDB from '../../../mongoDB';
import * as userQueries from '../../../mongoDB/queries/user';

export default (roles = []) =>
  async (req, res, next) => {
    // get token
    const authHeader =
      req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: 'Invalid User' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Invalid User' });
    }

    //token validation
    const { jwtSecrete } = config.passManager;
    const userInfo = jwt.verify(token, jwtSecrete);
    if (!userInfo) return res.status(401).json({ error: 'Invalid User' });

    // get User data from DB
    const { id: userId } = userInfo;
    const userData = await userQueries.findUserByCondition(
      MongoDB,
      {
        userId,
      },
      { password: 0, salt: 0, createdAt: 0, lastLoginAt: 0 }
    );
    if (!userData) res.status(401).json({ error: 'User Not Found' });

    //check user Role
    const { role } = userData;
    if (!roles.includes(role)) {
      return res.status(400).send({
        message: 'permission denied',
      });
    }

    // set User data for other middleware
    req.userData = { ...userData };

    next();
  };
