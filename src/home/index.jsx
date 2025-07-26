// NOTE: https://etherscan.io/
import { FaArrowRightLong } from "react-icons/fa6";
import { AiOutlineTransaction } from "react-icons/ai";
import { IoCubeOutline } from "react-icons/io5";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatTimestamp, HorizontalSep } from "#/utils";
import Api from "#/api";

const LIST_TYPE = {
  BLOCK: {label: "Latest Blocks", link: "VIEW ALL BLOCKS"},
  TRANSACTION: {label: "Latest Transactions", link: "VIEW ALL TRANSACTIONS"}
};

function LabelListComponent({icon, id, timestamp, content, amount, shouldAddSepBottom}) {
  console.log(icon, id, timestamp, content, amount)
  return (
    <div className="px-3">
      <div className="flex gap-3 py-2 text-xs">
        <div className="p-3 bg-[rgb(27,27,27)] w-fit h-fit rounded align-center my-auto">
          <div className="w-fit h-fit text-xl">{icon}</div>
        </div>
        <div className="my-auto">
          <div className="card-link">{id}</div>
          <div className="text-card-time-gray text-xs">{formatTimestamp(timestamp)} ago</div>
        </div>
        <div className="grow my-auto">
          {content}
        </div>
        <div className="my-auto border-1 border-gray-600 p-1 text-xs font-bold rounded my-auto">
          {amount}
        </div>
      </div>
      {shouldAddSepBottom ? <HorizontalSep/> : <></>}
    </div>
  );
}

function LabelList({type, icon, data, contentFunc, onLinkClicked}) {
  console.log(data);
  return (
    <div className="text-white w-[500px] h-[560px] flex flex-col card">
      <div className="text-center w-full p-3 font-bold">
        {type.label}
      </div>
      <HorizontalSep/>
      <div className="overflow-auto custom-scrollbar grow">
        {
          data.map((x, i) => <LabelListComponent key={i} icon={icon} id={x.id} timestamp={x.timestamp} content={contentFunc(x)} amount={x.amount} shouldAddSepBottom={i < (data.length-1)}/>)
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

function BlockContent({miner, transactionCount, duration}) {
  return (
    <div>
      Miner <span className="card-link">{miner.name}</span><br/>
      <span className="card-link">{transactionCount} txns</span>&nbsp;
      <span className="text-card-time-gray">in {formatTimestamp(duration)}</span>
    </div>
  );
}

function TransactionContent({fromAddress, toAddress}) {
  return (
    <div style={{"textOverflow": "ellipsis"}}>
      From <span className="card-link">{fromAddress}</span><br/>
      To <span className="card-link">{toAddress}</span>
    </div>
  );
}

export default function() {
  const navigate = useNavigate();
  const [blocks, setBlocks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  useEffect(() => {
    Api.getLatestBlocks().then(latestBlocks => {
      setBlocks(latestBlocks);
    }).catch(console.error);
    Api.getLatestTransactions().then(latestTransactions => {
      setTransactions(latestTransactions);
    }).catch(console.error);
  }, []);
  return (
    <div className="w-screen h-screen flex">
      <div className="my-auto flex w-full h-fit justify-center gap-5">
        <LabelList onLinkClicked={() => navigate("/blocks")} type={LIST_TYPE.BLOCK} data={blocks} icon={<IoCubeOutline/>} contentFunc={BlockContent}/>
        <LabelList onLinkClicked={() => navigate("/transactions")} type={LIST_TYPE.TRANSACTION} data={transactions} icon={<AiOutlineTransaction/>} contentFunc={TransactionContent}/>
      </div>
    </div>
  );
}
