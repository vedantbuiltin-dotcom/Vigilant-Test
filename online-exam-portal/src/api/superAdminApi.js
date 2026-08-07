import client from './client';

export const superAdminApi = {
  listAdmins: async () => {
    const res = await client.get('/admin/admins');
    return res.data.admins;
  },
  createAdmin: async (adminData) => {
    const res = await client.post('/admin/admins', adminData);
    return res.data;
  },
  deleteAdmin: async (adminId) => {
    const res = await client.delete(`/admin/admins/${adminId}`);
    return res.data;
  }
};
