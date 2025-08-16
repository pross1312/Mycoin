// NOTE: https://etherscan.io/
import {FaArrowRightLong} from "react-icons/fa6";
import {AiOutlineTransaction} from "react-icons/ai";
import {IoCubeOutline} from "react-icons/io5";
import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {mapLinkIfNeeded, getFullLink, formatTimestamp, HorizontalSep, formatLink, formatCurrency} from "#/utils";
import Api from "#/api";

const LIST_TYPE = {
  BLOCK: {label: "Latest Blocks", link: "VIEW ALL BLOCKS", idLinkPrefix: "/detail/block"},
  TRANSACTION: {label: "Latest Transactions", link: "VIEW ALL TRANSACTIONS", idLinkPrefix: "/detail/transaction"}
};

function LabelListComponent({idLinkPrefix = "", icon, id, timestamp, content, amount, shouldAddSepBottom}) {
  return (
    <div className="px-3">
      <div className="flex gap-3 py-2 text-xs">
        <div className="p-3 bg-[rgb(27,27,27)] w-fit h-fit rounded align-center my-auto">
          <div className="w-fit h-fit text-xl">{icon}</div>
        </div>
        <div className="my-auto">
          <div>{mapLinkIfNeeded(id, idLinkPrefix, 10)}</div>
          <div className="text-card-time-gray text-xs">{formatTimestamp(Date.now() - timestamp)} ago</div>
        </div>
        <div className="grow my-auto">
          {content}
        </div>
        <div className="my-auto border-1 border-gray-600 p-1 text-xs font-bold rounded my-auto">
          {formatCurrency(amount)}
        </div>
      </div>
      {shouldAddSepBottom ? <HorizontalSep/> : <></>}
    </div>
  );
}

function LabelList({type, icon, data, contentFunc, onLinkClicked}) {
  return (
    <div className="text-white w-full h-full flex flex-col card">
      <div className="text-center w-full p-3 font-bold">
        {type.label}
      </div>
      <HorizontalSep/>
      <div className="overflow-auto custom-scrollbar grow">
        {
          data.map((x, i) => <LabelListComponent idLinkPrefix={type.idLinkPrefix} key={i} icon={icon} id={x.id} timestamp={x.timestamp} content={contentFunc(x)} amount={x.amount} shouldAddSepBottom={i < (data.length-1)}/>)
        }
      </div>
      <HorizontalSep/>
      <div className="font-bold text-[0.7rem] cursor-pointer hover:text-gray-300 text-gray-400 text-center p-2 flex justify-center gap-2">
        <div className="my-auto flex gap-2" onClick={onLinkClicked}>
          <div className="my-auto">{type.link}</div>
          <div className="text-center my-auto"><FaArrowRightLong/></div>
        </div>
      </div>
    </div>
  );
}

function BlockContent({id, miner, transactionCount, duration}) {
  return (
    <div>
      Miner <span className="link">{mapLinkIfNeeded(miner, "/wallet", 10)}</span><br/>
      <span>{mapLinkIfNeeded(formatLink(transactionCount.toString() + " txns", getFullLink(id)), "/transactions")}</span>&nbsp;
      <span className="text-card-time-gray">in {formatTimestamp(duration)}</span>
    </div>
  );
}

function TransactionContent({from, to}) {
  return (
    <div style={{"textOverflow": "ellipsis"}}>
      From {mapLinkIfNeeded(from, "/wallet", 10)}<br/>
      To {mapLinkIfNeeded(to, "/wallet", 10)}
    </div>
  );
}

export default function() {
  const navigate = useNavigate();
  const [blocks, setBlocks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  useEffect(() => {
    Api.getLatestBlocks().then(latestBlocks => {
      setBlocks(latestBlocks.map(block => { return {
        ...block,
        id: formatLink(block.id),
      }}));
    }).catch(console.error);
    Api.getLatestTransactions().then(latestTransactions => {
      setTransactions(latestTransactions.map(tx => { return {
        ...tx,
        id: formatLink(tx.id),
      }}));
    }).catch(console.error);
  }, []);
  return (
    <div className="w-full h-full flex justify-center">
      <div className="my-auto flex w-3/5 h-4/6 gap-5">
        <LabelList onLinkClicked={() => navigate("/blocks")} type={LIST_TYPE.BLOCK} data={blocks} icon={<IoCubeOutline/>} contentFunc={BlockContent}/>
        <LabelList onLinkClicked={() => navigate("/transactions")} type={LIST_TYPE.TRANSACTION} data={transactions} icon={<AiOutlineTransaction/>} contentFunc={TransactionContent}/>
      </div>
    </div>
  );
}
