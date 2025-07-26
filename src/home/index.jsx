// NOTE: https://etherscan.io/
import { FaArrowRightLong } from "react-icons/fa6";
import { AiOutlineTransaction } from "react-icons/ai";
import { IoCubeOutline } from "react-icons/io5";

const LIST_TYPE = {
  BLOCK: {label: "Latest Blocks", link: "VIEW ALL BLOCKS"},
  TRANSACTION: {label: "Latest Transactions", link: "VIEW ALL TRANSACTIONS"}
};

function HorizontalSep() {
  return (
    <div className="w-full bg-gray-600 h-[1px]">
    </div>
  );
}

export function parseMilis(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  // return new Date(timestamp).toISOString()
}

export function formatTimestamp(timestamp) {
  if (timestamp < 60) return `${timestamp} secs`;
  if (timestamp < 3600) return `${Math.floor(timestamp / 60)} mins`;
  if (timestamp < 86400) return `${Math.floor(timestamp / 3600)} hours`;
  if (timestamp < 604800) return `${Math.floor(diff / 86400)} days`;
  return parseMilis(timestamp);
}

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

function LabelList({type, icon, data, contentFunc}) {
  console.log(data);
  return (
    <div className="text-white w-[500px] h-[560px] !bg-card rounded-lg border-1 border-gray-700 flex flex-col" style={{"boxShadow": "0 0.5rem 1.2rem rgba(82, 85, 92, .15)"}}>
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
        <div className="my-auto">{type.link}</div>
        <div className="text-center my-auto"><FaArrowRightLong/></div>
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
  const blocks = [
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
    },
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
    },
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
    },
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
    },
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
    },
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
    },
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
    },
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
    },
  ];
  const transactions = [
    {
      id: 123321,
      amount: 0.23123,
      timestamp: 10000,
      fromAddress: "some hash",
      toAddress: "some verylong hashsdjhiofjiowejjeowiqjeoi",
    },
  ];
  return (
    <div className="bg-black w-screen h-screen flex">
      <div className="my-auto flex w-full h-fit justify-center gap-5">
        <LabelList type={LIST_TYPE.BLOCK} data={blocks} icon={<IoCubeOutline/>} contentFunc={BlockContent}/>
        <LabelList type={LIST_TYPE.TRANSACTION} data={transactions} icon={<AiOutlineTransaction/>} contentFunc={TransactionContent}/>
      </div>
    </div>
  );
}
