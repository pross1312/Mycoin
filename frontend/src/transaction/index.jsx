import {useEffect, useState} from "react";
import {formatTimestamp, capitalize, getLink, getFullLink, formatLink, formatCurrency} from "#/utils";
import {Table} from "#/components/table";
import Api from "#/api";

const LIMIT = 9;

export default function() {
  const labels = ["Id", "Block", "Initiator", "Timestamp", "Receiver", "Amount"];

  const [transactionsData, setTransactionsData] = useState({
    pagination: {},
    data: []
  });

  const block_id = getFullLink(getLink());
  const getTransactions = (page = 1) => {
    Api.getTransactions(page, LIMIT).then(result => {
      console.log(result);
      result.data = capitalize(result.data.map(x => ({...x, amount: formatCurrency(x.amount), block: formatLink(x.block)})));
      result.onPaginationClick = getTransactions;
      setTransactionsData(result);
    }).catch(console.error);
  }
  const getBlockTransactions = (page = 1) => {
    console.log(page);
    Api.getBlockTransactions(block_id, page, LIMIT).then(result => {
      result.data = capitalize(result.data.map(x => ({...x, amount: formatCurrency(x.amount), block: formatLink(x.block)})));
      result.onPaginationClick = getBlockTransactions;
      setTransactionsData(result);
    }).catch(console.error);
  }

  useEffect(() => {
    if (block_id) {
      getBlockTransactions();
    } else {
      getTransactions()
    }
  }, [block_id]);

  return (
    <div className="h-full w-full place-items-center flex flex-col justify-center text-white">
      <div className="w-3/4 h-5/6">
        <Table labels={labels} data={transactionsData.data} pagination={transactionsData.pagination} name="transactions"
               onPaginationClick={transactionsData.onPaginationClick}
               linkHandler={(label) => {
                 if (label === "Block") {
                   return "/detail/block";
                 }
                 return "/wallet";
               }}/>
      </div>
    </div>
  )
}
