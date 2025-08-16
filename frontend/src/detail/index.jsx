import {useEffect, useState} from "react";
import {useLocation} from "react-router-dom";
import {formatCurrency, formatLink, formatTimestamp, mapLinkIfNeeded, getLink, getShortLink, getFullLink} from "#/utils";
import Api from "#/api"

function Detail({block, transaction}) {
  if (block) {
    return (
      <div className="card p-4 text-white w-full">
        <h2 className="text-lg font-semibold mb-3">Block #{block.id}</h2>
        <div className="flex flex-col gap-2 text-sm">
          <div><span className="text-gray-400">Prev Hash:</span> <span className="font-mono">{block.prevHash}</span></div>
          <div><span className="text-gray-400">Hash:</span> <span className="font-mono">{block.hash}</span></div>
          <div><span className="text-gray-400">Nounce:</span> {block.nounce}</div>
          <div><span className="text-gray-400">Miner:</span> {mapLinkIfNeeded(block.miner, "/wallet")}</div>
          <div><span className="text-gray-400">Duration:</span> {block.duration} msecs</div>
          <div><span className="text-gray-400">Transactions:</span> {mapLinkIfNeeded(block.transactionCount, "/transactions")}</div>
          <div><span className="text-gray-400">Timestamp:</span> {formatTimestamp(block.timestamp)}</div>
        </div>
      </div>
    );
  }

  if (transaction) {
    return (
      <div className="card p-4 text-white w-full">
        <h2 className="text-lg font-semibold mb-3">Transaction #{transaction.id}</h2>
        <div className="flex flex-col gap-2 text-sm">
          <div><span className="text-gray-400">Block:</span> {mapLinkIfNeeded(transaction.block, "/detail/block")}</div>
          <div><span className="text-gray-400">From:</span> {mapLinkIfNeeded(transaction.from, "/wallet")}</div>
          <div><span className="text-gray-400">To:</span> {mapLinkIfNeeded(transaction.to, "/wallet")}</div>
          <div className="flex"><span className="text-gray-400">Amount:</span>&nbsp;{formatCurrency(transaction.amount || 0)}</div>
          <div><span className="text-gray-400">Timestamp:</span> {formatTimestamp(transaction.timestamp)}</div>
        </div>
      </div>
    );
  }

  return <div className="text-gray-400">No data available</div>;
}

export default function() {
  console.log(useLocation());
  const is_block = useLocation().pathname.indexOf("block") !== -1;
  const link = getLink();
  const id_short = getShortLink(link);
  const id_full = getFullLink(link);
  const [data, setData] = useState({});

  useEffect(() => {
    Api.getDetail(is_block ? "block" : "transaction", id_full).then(data => {
      if (!is_block) {
        data.block = formatLink(data.block.toString());
      } else {
        data.transactionCount = formatLink(data.transactionCount, data.id);
      }
      setData(data);
    }).catch(console.error);
  }, [is_block]);

  return (
    <div className="w-full h-full flex justify-center">
      <div className="my-auto flex max-w-3/5 max-h-4/6 gap-5">
      {
        is_block ? <Detail block={data}/> : <Detail transaction={data}/>
      }
      </div>
    </div>
  );
}
