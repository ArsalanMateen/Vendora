import User from '../models/user.model.js';
import errorHandler from '../helpers/dbErrorHandler.js';


const create = async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    return res.status(200).json({ message: 'Successfully signed up!' });
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) });
  }
};

const userByID = async (req, res, next, id) => {
  try {
    let query = User.findById(id);
    if (req.method === 'GET' && !req.path.startsWith('/api/stripe_auth/'))
      query = query.select('_id name email seller created updated').lean();
    let user = await query;
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    req.profile = user;
    next();
  } catch (err) {
    return res.status(400).json({ error: 'Could not retrieve user' });
  }
};

const read = (req, res) => {
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;

  return res.json({
    _id: req.profile._id,
    name: req.profile.name,
    email: req.profile.email,
    seller: req.profile.seller,
    created: req.profile.created,
    updated: req.profile.updated,
  });
};

const list = async (req, res) => {
  try {
    let users = await User.find().select('_id name created seller').lean();
    res.json(users);
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) });
  }
};

export default { create, userByID, read, list };
