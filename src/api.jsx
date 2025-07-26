export default {
  getLatestBlocks: async () => {
    return [
      {
        id: 123321,
        amount: 0.23123,
        timestamp: 10000,
        miner: {
          name: "some name",
          address: "some address"
        },
        transactionCount: 165,
        duration: 10000
      }
    ];
  },

  getLatestTransactions: async () => {
    return [
      {
        id: 123321,
        amount: 0.23123,
        timestamp: 10000,
        fromAddress: "some name",
        toAddress: "some address",
        transactionCount: 165,
        duration: 10000
      }
    ];
  }
}
