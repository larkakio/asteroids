import { Attribution } from "ox/erc8021";
import { base, baseSepolia } from "wagmi/chains";
import type { Chain } from "wagmi/chains";

const raw = process.env.NEXT_PUBLIC_CHAIN_ID ?? "8453";
const parsed = Number(raw);

export const targetChainId: 8453 | 84532 =
  parsed === 84532 ? 84532 : 8453;

export function getTargetChain(): Chain {
  return targetChainId === 84532 ? baseSepolia : base;
}

export function getCheckInContractAddress(): `0x${string}` | undefined {
  const a = process.env.NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS;
  if (!a || !a.startsWith("0x")) return undefined;
  return a as `0x${string}`;
}

export function getBuilderDataSuffix(): `0x${string}` {
  const override = process.env.NEXT_PUBLIC_BUILDER_CODE_SUFFIX;
  if (override?.startsWith("0x")) {
    return override as `0x${string}`;
  }
  const code = process.env.NEXT_PUBLIC_BUILDER_CODE;
  if (!code) {
    throw new Error(
      "Set NEXT_PUBLIC_BUILDER_CODE or NEXT_PUBLIC_BUILDER_CODE_SUFFIX",
    );
  }
  return Attribution.toDataSuffix({ codes: [code] });
}
