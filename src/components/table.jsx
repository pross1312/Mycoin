import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import {mapLinkIfNeeded} from "#/utils";
function Paginator({pagination}) {
  const currentPage = pagination?.page || 0;
  const totalPage = pagination?.totalPage || 0;
  return (
    <div className="flex justify-between w-fit place-items-center gap-1">
      <div className={`pagination-box ${currentPage > 1 ? "pagination-box-enabled" : "pagination-box-disabled"}`}>
        First
      </div>
      <div className={`pagination-box ${currentPage > 1 ? "pagination-box-enabled" : "pagination-box-disabled"}`}>
        <FaArrowLeft/>
      </div>
      <div className="pagination-box pagination-box-nohover !px-3">
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

export function Table({labels, data, name, linkHandler, pagination}) {
  return (
    <div className="card w-full h-full overflow-auto custom-scrollbar">
      <div className="p-3 h-fit flex justify-between sticky top-0 bg-card">
        <div>
          Total of {data.length} {name}
        </div>
        <div>
          <Paginator pagination={pagination}/>
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
            data.map((item, i) => (
              <tr key={i} className="border-b border-seperator">
                { labels.map((label, j) =><td key={j} className="p-3">{mapLinkIfNeeded(item[label], linkHandler(label))}</td>) }
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}
