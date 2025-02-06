import {Bytes, EntityOp, EntityTrigger, store} from "@graphprotocol/graph-ts";
import {Block, BlockDataSource} from "../generated/schema";
import {BlockTime} from "../generated/subgraph-QmcKB3XQyfNM2Uzzeyd9UmGqsw83Ysh8t9LGQD94DdfSS7";
import {BlockCost} from "../generated/subgraph-QmQ2kJphSSsSUXqnSAKLvxmhPGNxjVtrTsLTUPeCszns17";
import {BlockSize} from "../generated/subgraph-QmQRWu5c2EqssTHjGJyD9cUKRrArX6TGtVUWdYajdeC4My";

export function handleBlockTime(trigger: EntityTrigger<BlockTime>): void {
  if (trigger.operation !== EntityOp.Create) {
    return;
  }

  let blockTime = trigger.data;
  let blockData = BlockDataSource.load(blockTime.id);

  if (!blockData) {
    blockData = new BlockDataSource(blockTime.id);
    blockData.number = blockTime.number;
  }

  blockData.blockTime = blockTime.blockTime;
  blockData.save();

  maybeCreateBlock(blockData);
}

export function handleBlockCost(trigger: EntityTrigger<BlockCost>): void {
  if (trigger.operation !== EntityOp.Create) {
    return;
  }

  let blockCost = trigger.data;
  let blockData = BlockDataSource.load(blockCost.id);

  if (!blockData) {
    blockData = new BlockDataSource(blockCost.id);
    blockData.number = blockCost.number;
  }

  blockData.gasUsed = blockCost.gasUsed;
  blockData.save();

  maybeCreateBlock(blockData);
}

export function handleBlockSize(trigger: EntityTrigger<BlockSize>): void {
  if (trigger.operation !== EntityOp.Create) {
    return;
  }

  let blockSize = trigger.data;
  let blockData = BlockDataSource.load(blockSize.id);

  if (!blockData) {
    blockData = new BlockDataSource(blockSize.id);
    blockData.number = blockSize.number;
  }

  blockData.size = blockSize.size;
  blockData.save();

  maybeCreateBlock(blockData);
}

function maybeCreateBlock(blockData: BlockDataSource): void {
  if (blockData.blockTime === null || blockData.gasUsed === null || blockData.size === null) {
    return;
  }

  let block = new Block('auto');

  block.hash = Bytes.fromHexString(blockData.id);
  block.number = blockData.number;
  block.blockTime = blockData.blockTime!;
  block.gasUsed = blockData.gasUsed!;
  block.size = blockData.size!;

  block.save();

  store.remove("BlockDataSource", blockData.id);
}
