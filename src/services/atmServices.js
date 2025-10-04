import axios from "axios";

const vietqr = axios.create({
  baseURL: "https://api.vietqr.io",
  timeout: 15000,
});

export const vietqrServices = {
  getBanks: async () => {
    const res = await vietqr.get("/v2/banks");
    if (res?.data?.data && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    return [];
  },
};
