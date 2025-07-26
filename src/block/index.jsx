import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import {formatTimestamp, HorizontalSep} from "#/utils";

function Paginator({currentPage, totalPage}) {
  return (
    <div className="flex justify-between w-fit place-items-center gap-1">
      <div className={`pagination-box ${currentPage > 1 ? "pagination-box-enabled" : "pagination-box-disabled"}`} disabled={true}>
        First
      </div>
      <div className={`pagination-box ${currentPage > 1 ? "pagination-box-enabled" : "pagination-box-disabled"}`}>
        <FaArrowLeft/>
      </div>
      <div className="pagination-box !px-3">
        Page {currentPage} of {totalPage}
      </div>
      <div className={`pagination-box ${currentPage < totalPage-1 ? "pagination-box-enabled" : "pagination-box-disabled"}`}>
        <FaArrowRight/>
      </div>
      <div className={`pagination-box ${currentPage < totalPage-1 ? "pagination-box-enabled" : "pagination-box-disabled"}`}>
        Last
      </div>
    </div>
  );
}

export default function() {
  const labels = ["Block", "Age", "Txn", "Miner", "Reward"];
  const data = [
    {
      Block: "123123",
      Age: `${formatTimestamp(1231)} ago`,
      Txn: 123,
      Miner: "jwqioejqwioejiwqoeji",
      Reward: 0.21,
    }
  ];
  return (
    <div className="w-full h-full place-items-center flex flex-col justify-center text-white">
      <div className="card w-3/4 h-5/6">
        <div className="p-3 h-fit flex justify-between">
          <div>
            Total of {data.length} blocks
          </div>
          <div>
            <Paginator currentPage={1} totalPage={10}/>
          </div>
        </div>
        <table class="table-auto w-full text-start">
          <thead>
            <tr>
              {
                labels.map((label, i) => <th className="border-b border-seperator text-start p-3" key={i}>{label}</th>)
              }
            </tr>
          </thead>
          <tbody>
            {
              data.map((item, i) => (
                <tr key={i} className="border-b border-seperator">
                  { labels.map((label, j) =><td key={j} className="p-3">{item[label]}</td>) }
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
