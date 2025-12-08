import {create} from 'zustand';
import axios from 'axios';

export const useStore = create((set) => ({
  password: 'Admin@123',
  data: [],
  loading: false,
  attackResult: null,
  attacking: null,
  verifyResult: null,
  verifying: null,
  setPassword: (password) => set({ password }),
  handleBenchmark: async (password) => {
    if (!password) return alert('Nhập pass!');
    set({ loading: true, data: [], attackResult: null, verifyResult: null });
    try {
      const res = await axios.post('http://localhost:3000/api/benchmark', {
        password,
      });
      set({ data: res.data });
    } catch (e) {
      console.error(e);
      alert('Lỗi Server!');
    } finally {
      set({ loading: false });
    }
  },
  handleVerify: async (password, algo) => {
    set({ verifying: algo, verifyResult: null });
    try {
        const res = await axios.post('http://localhost:3000/api/verify', { password, algo });
        set({ verifyResult: res.data });
    } catch (error) {
        console.error("Lỗi Verify:", error);
        alert('Lỗi khi xác thực!');
    } finally {
        set({ verifying: null });
    }
  },
  handleAttack: async (algo) => {
    set({ attacking: algo, attackResult: null });
    try {
      const res = await axios.post('http://localhost:3000/api/attack', {
        algo,
      });
      set({ attackResult: res.data });
    } catch (e) {
      console.error(e);
      alert('Lỗi Attack!');
    } finally {
      set({ attacking: null });
    }
  },
}));

