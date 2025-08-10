import {useEffect, useState} from "react";
import {formatTimestamp, capitalize} from "#/utils";
import {Table} from "#/components/table";
import Api from "#/api";

const LIMIT = 9;

export default function() {
  const labels = ["Id", "Initiator", "Timestamp", "Receiver", "Amount"];

  const [transactionsData, setTransactionsData] = useState({
    pagination: {},
    data: []
  });

  const getTransactions = (page = 1) => {
    Api.getTransactions(page, LIMIT).then(result => {
      result.data = capitalize(result.data);
      console.log(result);
      setTransactionsData(result);
    }).catch(console.error);
  }

  useEffect(() => {
    getTransactions()
  }, []);

  return (
    <div className="h-full w-full place-items-center flex flex-col justify-center text-white">
      <div className="w-3/4 h-5/6">
        <Table labels={labels} data={transactionsData.data} pagination={transactionsData.pagination} name="transactions"
               onPaginationClick={page => getTransactions(page)} linkHandler={(label) => "/transaction"}/>
      </div>
    </div>
  )
}
