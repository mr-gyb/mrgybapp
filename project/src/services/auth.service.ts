import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
  signOut
} from 'firebase/auth';
import { auth } from '../lib/firebase';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  phoneNumber?: string;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    try {
      const { email, password } = credentials;
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { user: userCredential.user };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async register(data: RegisterData) {
    try {
      const { email, password } = data;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { user: userCredential.user };
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  async verifyEmail(token: string) {
    // Firebase handles email verification through links
    // This method would be used for custom verification flows
    return { success: true };
  },

  async forgotPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  async resetPassword(token: string, password: string) {
    // Firebase handles password reset through links
    // This method would be used for custom reset flows
    return { success: true };
  },

  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
};