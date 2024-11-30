import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  register,
  verifyUser,
  login,
  myProfile,
  updateProfile,
  changePassword,
  getUserPayments,
  getAllUsers
} from '../controllers/userController.js';
import User from '../models/userModel.js';
import Payment from '../models/paymentModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { sendMail } from '../middlewares/sendMail.js';


vi.mock('../models/userModel.js', () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    exists: vi.fn(),
    find: vi.fn()
  }
}));

vi.mock('../models/paymentModel.js', () => ({
  default: {
    find: vi.fn()
  }
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn()
  }
}));

vi.mock('bcrypt', () => ({
  default: {
    compare: vi.fn()
  }
}));

vi.mock('../middlewares/sendMail.js', () => ({
  sendMail: vi.fn()
}));

process.env.ACTIVATION_TOKEN_SECRET = 'test_activation_secret';
process.env.JWT_SECRET = 'test_jwt_secret';

const mockRequest = (body = {}, params = {}, user = null) => ({
  body,
  params,
  user
});

const mockResponse = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('User Controller', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const req = mockRequest({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      const res = mockResponse();

      User.findOne.mockResolvedValue(null);
      jwt.sign.mockReturnValue('mock_activation_token');
      sendMail.mockResolvedValue();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Nous vous avons envoyé un code dans votre email pour l\'activation de votre compte',
          activationToken: 'mock_activation_token'
        })
      );
    });

    it('should return error if user already exists', async () => {
      const req = mockRequest({
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123'
      });
      const res = mockResponse();

      User.findOne.mockResolvedValue({ email: 'existing@example.com' });

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
          message: 'Un utilisateur avec cet email existe déjà'
      });
    });
  });

  describe('verifyUser', () => {
    it('should verify user successfully', async () => {
      const req = mockRequest({
        activationToken: 'mock_activation_token',
        otp: 'mock_otp'
      });
      const res = mockResponse();

      const verify = jwt.verify.mockReturnValue({ user: { _id: 'user_id' , email: 'test@example.com' }, otp: 'mock_otp' });
      const user = User.create.mockResolvedValue({ _id: 'user_id' , email: 'test@example.com' });

      await verifyUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Email vérifié avec succès',
        })
      );
    });

    it('should return error if OTP is Expired', async () => {
      const req = mockRequest({
        activationToken: 'mock_activation_token',   
        otp: 'invalid_otp'
      });
      const res = mockResponse();

      jwt.verify.mockReturnValue(false);

      await verifyUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Code expiré'
      });
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const req = mockRequest({
        email: 'test@example.com',
        password: 'password123'
      });
      const res = mockResponse();

      const mockUser = { _id: 'user_id', email: 'test@example.com' };
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mock_token');

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Connexion réussie',
          token: 'mock_token',
          user: mockUser
        })
      );
    });

    it('should return error for invalid credentials', async () => {
      const req = mockRequest({
        email: 'test@example.com',
        password: 'wrongpassword'
      });
      const res = mockResponse();

      User.findOne.mockResolvedValue({ email: 'test@example.com' });
      bcrypt.compare.mockResolvedValue(false);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Mot de passe invalide'
      });
    });
  });

});

describe('myProfile', () => {
    it('should return the user profile', async () => {
        const req = mockRequest({},{}, {user: {id: 'user_id'}});
        const res = mockResponse();

        const mockUser = { _id: 'user_id', name: 'Test User', email: 'test@example.com' };

        User.findById.mockResolvedValue(mockUser);

        await myProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            user: mockUser
        });
    })
})

describe('updateProfile in case of changing just the name', () => {
    it('should update user profile', async () => {
        const req = mockRequest({ name: 'New Test User', email: 'test@example.com' }, {}, {user: {id: 'user_id'}});
        const res = mockResponse();

        const mockUser = { _id: 'user_id', name: 'Test User', email: 'test@example.com' };
        User.findById.mockResolvedValue(mockUser);

        const updatedUser = { _id: 'user_id', name: 'New Test User', email: 'test@example.com' };
        User.findByIdAndUpdate.mockResolvedValue(updatedUser);


        await updateProfile(req, res);
        

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Profil mis à jour avec succès',
            user: updatedUser
        });
    })

    it('should send mail to verify the email in case of changing the email', async () => {
        const req = mockRequest({ name: 'Test User', email: 'updated@example.com' }, {}, {user: {id: 'user_id'}});
        const res = mockResponse();

        const mockUser = { _id: 'user_id', name: 'Test User', email: 'test@example.com' };
        User.findById.mockResolvedValue(mockUser);
        User.exists.mockResolvedValue(false);

        jwt.sign.mockReturnValue('mock_activation_token');
        sendMail.mockResolvedValue();

        await updateProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Nous vous avons envoyé un code dans votre email pour l\'activation de votre compte',
            activationToken: 'mock_activation_token'
        });
    })

    it('should return error if email already exists in case of changing the email', async () => {
        const req = mockRequest({ name: 'Test User', email: 'updated@example.com' }, {}, {user: {id: 'user_id'}});
        const res = mockResponse();

        const mockUser = { _id: 'user_id', name: 'Test User', email: 'test@example.com' };
        User.findById.mockResolvedValue(mockUser);
        User.exists.mockResolvedValue(true);

        await updateProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Un utilisateur avec cet email existe déjà'
        });
    })
})

describe('changePassword', () => {
    it('should change the password', async () => {
        const req = mockRequest({ password: 'new_password' }, {}, {user: {id: 'user_id'}});
        const res = mockResponse();

        const mockUser = { 
            _id: 'user_id', 
            name: 'Test User', 
            email: 'test@example.com', 
            password: 'old_password',
            save: vi.fn().mockResolvedValue(true)
        };
        
        User.findById.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(false);

        await changePassword(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Mot de passe mis à jour avec succès"
        });
    })

    it('should return error if new password is same as old password', async () => {
        const req = mockRequest({ password: 'new_password' }, {}, {user: {id: 'user_id'}});
        const res = mockResponse();

        const mockUser = { 
            _id: 'user_id', 
            name: 'Test User', 
            email: 'test@example.com', 
            password: 'old_password',
        };

        User.findById.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(true);

        await changePassword(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Le nouveau mot de passe ne peut pas être le même que l'ancien"
        });
    })
})

describe('getUserPayments', () => {
    it('should return the user payments', async () => {
        const req = mockRequest({}, {userId: 'user_id'});
        const res = mockResponse();

        const mockUser = { _id: 'user_id' };
        User.findById.mockResolvedValue(mockUser);

        const mockPayments = [];
        Payment.find.mockResolvedValue(mockPayments);

        await getUserPayments(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            payments: mockPayments
        });
    })

    it('should return error if user not found', async () => {
        const req = mockRequest({}, {userId: 'user_id'});
        const res = mockResponse();

        const mockUser = null;
        User.findById.mockResolvedValue(mockUser);
        const mockPayments = [];
        Payment.find.mockResolvedValue(mockPayments);

        await getUserPayments(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Utilisateur non trouvé'
        });
    })
})

describe('getAllUsers', () => {
    it('should return all users', async () => {
        const req = mockRequest();
        const res = mockResponse();

        const mockUsers = [];
        User.find.mockResolvedValue(mockUsers);

        await getAllUsers(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            users: mockUsers
        });
    })
})
