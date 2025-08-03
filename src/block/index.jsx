import {useEffect, useState} from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import {mapLinkIfNeeded, formatTimestamp, HorizontalSep} from "#/utils";
import api from "#/api";

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
  const [blocks, setBlocks] = useState([]);
  useEffect(() => {
    api.getAllBlocks().then(result => {
      console.log(result);
      result = result.map(block => { return {
        ...block,
        Age: formatTimestamp(Date.now() - block.Age)
      }})
      console.log(result);
      setBlocks(result);
    }).catch(console.error);
  }, [])
  return (
    <div className="w-full h-full place-items-center flex flex-col justify-center text-white">
      <div className="card w-3/4 h-5/6">
        <div className="p-3 h-fit flex justify-between">
          <div>
            Total of {blocks.length} blocks
          </div>
          <div>
            <Paginator currentPage={1} totalPage={10}/>
          </div>
        </div>
        <table className="table-auto w-full text-start">
          <thead>
            <tr>
              {
                labels.map((label, i) => <th className="border-b border-seperator text-start p-3" key={i}>{label}</th>)
              }
            </tr>
          </thead>
          <tbody>
            {
              blocks.map((item, i) => (
                <tr key={i} className="border-b border-seperator">
                  { labels.map((label, j) =><td key={j} className="p-3">{mapLinkIfNeeded(item[label], "/block")}</td>) }
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
