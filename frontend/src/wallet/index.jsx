import {useEffect, useState} from "react";
import { GiWallet } from "react-icons/gi";
import {capitalize, toHex} from "#/utils";
import Api from "#/api";
import {Table} from "#/components/table";

export default function() {
  const labels = ["Id", "Initiator", "Timestamp", "Amount"];
  const [transactionsData, setTransactionsData] = useState({
    pagination: {},
    data: []
  });
  const walletAddress = "MFIwEAYHKoZIzj0CAQYFK4EEAAMDPgAETaPdLpHhHB0F%2BVLpExID9o3030YH9tG%2F2et%2Fl3kpCcLmmipN122ZnFeai7n%2FAe3Ec4sNy9dP0Rzrv9BJ";
  useEffect(() => {
    Api.getWalletTransactions(walletAddress).then(result => {
      result.data = capitalize(result.data);
      setTransactionsData(result);
    }).catch(console.error);
  }, []);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center text-white overflow-hidden gap-4 p-6">
      {/* Wallet Info Header */}
      <div className="flex items-center w-3/4 text-lg font-medium bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 shadow-md">
        <div className="text-yellow-400 text-xl mr-2">
          <GiWallet />
        </div>
        <span className="text-gray-300">
          Wallet of{" "}
          <strong className="text-white font-mono">{toHex(walletAddress)}</strong>
        </span>
      </div>

      {/* Transactions Table */}
      <div className="w-3/4 flex-1 max-h-[80%]">
        <Table
          labels={labels}
          data={transactionsData.data}
          pagination={transactionsData.pagination}
          name="transactions"
          linkHandler={(label) => "/wallet"}
        />
      </div>
    </div>
  );
}
