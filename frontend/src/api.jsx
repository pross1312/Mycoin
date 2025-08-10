export const SERVER_ADDR = `/api`;
async function apiCall(path, options) {
  let {method, body, query, headers} = (options || {});
  if (method === undefined) method = "GET";
  const queryString = new URLSearchParams(query || {}).toString();
  const fetchOptions = { method };
  if (body) fetchOptions.body = body;
  if (headers) fetchOptions.headers = headers;

  return new Promise((resolve, reject) => {
    fetch(`${SERVER_ADDR}${path}?${queryString}`, fetchOptions).then(async (result) => {
      const {success, data, status_code} = await result.json()
      resolve([success, status_code, data]);
    }).catch(reject);
  })
}

export default {
  getLatestBlocks: async () => {
    const [success, code, data] = await apiCall('/latest-block')
    if (!success) {
      throw data;
    }
    return data;
  },

  getLatestTransactions: async () => {
    const [success, code, data] = await apiCall('/latest-transaction')
    if (!success) {
      throw data;
    }
    return data;
  },

  getAllBlocks: async (page = 1, limit = 10) => {
    const [success, code, data] = await apiCall("/blocks", {
      query: { page, limit }
    });
    if (!success) {
      throw data;
    }
    return data;
  },

  getWalletTransactions: async (id, page = 1, limit = 10) => {
    const [success, code, data] = await apiCall(`/transaction/wallet/${encodeURIComponent(id)}`, {
      query: { page, limit }
    });
    if (!success) {
      throw data;
    }
    return data;
  },

  getLocalWallet: async () => {
    const [success, code, data] = await apiCall('/wallet');
    if (!success) {
      throw data;
    }
    return data;
  },

  newTransaction: async (recipient, amount) => {
    const [success, code, data] = await apiCall('/transaction', {
      method: "POST",
      body: JSON.stringify({recipient, amount}),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!success) {
      throw data;
    }
    return data;
  },

  getTransactions: async (page = 1, limit = 10) => {
    const [success, code, data] = await apiCall("/transactions", {
      query: { page, limit }
    });
    if (!success) {
      throw data;
    }
    return data;
  },
}
