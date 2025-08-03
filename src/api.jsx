export const SERVER_ADDR = "http://localhost:9000";
async function apiCall(path, options) {
  let {method, body, query} = (options || {});
  if (method === undefined) method = "GET";
  const queryString = new URLSearchParams(query || {}).toString();

  return new Promise((resolve, reject) => {
    fetch(`${SERVER_ADDR}${path}?${queryString}`, {
      method
    }).then(async (result) => {
      const {success, data, status_code} = await result.json()
      resolve([success, status_code, data]);
    }).catch(reject);
  })
}

export default {
  getLatestBlocks: async () => {
    const [success, code, data] = await apiCall('/latest-block')
    if (!success) {
      throw new Error(data);
    }
    return data;
  },

  getLatestTransactions: async () => {
    const [success, code, data] = await apiCall('/latest-transaction')
    if (!success) {
      throw new Error(data);
    }
    return data;
  },

  getAllBlocks: async () => {
    const [success, code, data] = await apiCall('/blocks');
    if (!success) {
      throw new Error(data);
    }
    return data;
  }
}
