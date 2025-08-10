import {useEffect, useState} from "react";
import {formatTimestamp, capitalize} from "#/utils";
import {Table} from "#/components/table";
import api from "#/api";

const LIMIT = 9;

export default function() {
  const labels = ["Block", "Age", "Txn", "Miner", "Reward"];
  const [blocksData, setBlocksData] = useState({
    pagination: {},
    data: []
  });
  const getBlocks = (page = 1) => {
    api.getAllBlocks(page, LIMIT).then(result => {
      result.data = result.data.map(block => {
        block = capitalize(block);
        block.Age = formatTimestamp(Date.now() - block.Age);
        return block;
      });
      setBlocksData(result);
    }).catch(console.error);
  };
  useEffect(() => {
    getBlocks();
  }, [])
  return (
    <div className="h-full w-full place-items-center flex flex-col justify-center text-white">
      <div className="w-3/4 h-5/6">
        <Table labels={labels} data={blocksData.data} pagination={blocksData.pagination} name="blocks"
               onPaginationClick={page => getBlocks(page)} linkHandler={(label) => "/wallet"}/>
      </div>
    </div>
  )
}
