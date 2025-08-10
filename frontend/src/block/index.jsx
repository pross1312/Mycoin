import {useEffect, useState} from "react";
import {formatTimestamp} from "#/utils";
import {Table} from "#/components/table";
import api from "#/api";

export default function() {
  const labels = ["Block", "Age", "Txn", "Miner", "Reward"];
  const [blocksData, setBlocksData] = useState({
    pagination: {},
    data: []
  });
  useEffect(() => {
    api.getAllBlocks().then(result => {
      result.data = result.data.map(block => ({
        ...block,
        Age: formatTimestamp(Date.now() - block.Age)
      }));
      setBlocksData(result);
    }).catch(console.error);
  }, [])
  return (
    <div className="h-full w-full place-items-center flex flex-col justify-center text-white">
      <div className="w-3/4 h-5/6">
        <Table labels={labels} data={blocksData.data} pagination={blocksData.pagination} name="blocks" linkHandler={(label) => "/wallet"}/>
      </div>
    </div>
  )
}
