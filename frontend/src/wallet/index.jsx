import {useEffect, useState} from "react";
import {useLocation} from "react-router-dom";
import { GiWallet } from "react-icons/gi";
import {capitalize, toHex} from "#/utils";
import Api from "#/api";
import {Table} from "#/components/table";
import Clipboard from "#/components/clipboard";

const LIMIT = 8;

export default function() {
  const labels = ["Id", "Initiator", "Timestamp", "Receiver", "Amount"];

  const [transactionsData, setTransactionsData] = useState({
    pagination: {},
    data: []
  });
  const getTransactions = (page = 1) => {
    Api.getWalletTransactions(walletAddress, page, LIMIT).then(result => {
      result.data = capitalize(result.data);
      setTransactionsData(result);
    }).catch(console.error);
  }
  const walletAddress = useLocation().pathname.substr("/wallet/".length);
  useEffect(() => {
    getTransactions()
  }, [walletAddress]);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center text-white overflow-hidden gap-4 p-6">
      {/* Wallet Info Header */}
      <div className="flex items-center w-3/4 text-lg font-medium bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 shadow-md gap-2">
        <div className="text-yellow-400 text-xl">
          <GiWallet />
        </div>
        <div className="text-gray-300 text-nowrap my-auto">
          Wallet of&nbsp;<strong className="text-white font-mono">{toHex(walletAddress)}</strong>
        </div>
        <Clipboard text={walletAddress}/>
      </div>

      {/* Transactions Table */}
      <div className="w-3/4 flex-1 max-h-[80%]">
        <Table
          labels={labels}
          data={transactionsData.data}
          pagination={transactionsData.pagination}
          name="transactions"
          onPaginationClick={page => getTransactions(page)}
          linkHandler={(label) => "/wallet"}
        />
      </div>
    </div>
  );
}
