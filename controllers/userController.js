const User = require('../models/user');

const userController = {
  // GET /api/v1/users/me
  getProfile: async (request, response) => {
    try {
      const userId = request.userId || request.user?._id;
      if (!userId) {
        return response.status(401).json({ message: 'Unauthorized access' });
      }

      const user = await User.findById(userId).select('-password');
      if (!user) {
        return response.status(404).json({ message: 'User not found' });
      }

      return response.status(200).json({ message: 'Profile retrieved', result: user });
    } catch (e) {
      return response.status(500).json({ message: e.message });
    }
  },

  // PUT /api/v1/users/me
  updateProfile: async (request, response) => {
    try {
      const userId = request.userId || request.user?._id;
      if (!userId) {
        return response.status(401).json({ message: 'Unauthorized access' });
      }

      const { name, email, bio, avatarUrl, password } = request.body;
      const update = {};
      if (name !== undefined) update.name = name;
      if (email !== undefined) update.email = email;
      if (bio !== undefined) update.bio = bio;
      if (avatarUrl !== undefined) update.avatarUrl = avatarUrl;

      // Password changes go through a separate hashing step — never store
      // it plain, and only touch it if the user actually submitted one.
      if (password) {
        const bcrypt = require('bcrypt');
        const { SALT_ROUNDS } = require('../utlis/config');
        update.password = await bcrypt.hash(password, SALT_ROUNDS);
      }

      const updatedUser = await User.findByIdAndUpdate(userId, update, {
        new: true,
        runValidators: true,
      }).select('-password');

      if (!updatedUser) {
        return response.status(404).json({ message: 'User not found' });
      }

      return response.status(200).json({ message: 'Profile updated', result: updatedUser });
    } catch (e) {
      return response.status(500).json({ message: e.message });
    }
  },
};

module.exports = userController;