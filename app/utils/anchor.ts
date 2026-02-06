import { Program, IdlAccounts, BN, AnchorProvider } from "@coral-xyz/anchor";
import IDL from "../idl/cookie.json";
import { Cookie } from "@/idl/cookie";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { WrappedConnection } from "./wrappedConnection";
import {
  AnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { useMemo } from "react";

export const CONNECTION = new WrappedConnection(
  process.env.NEXT_PUBLIC_RPC
    ? process.env.NEXT_PUBLIC_RPC
    : "http://localhost:8899",
  {
    wsEndpoint: process.env.NEXT_PUBLIC_WSS_RPC
      ? process.env.NEXT_PUBLIC_WSS_RPC
      : "ws://localhost:8899",
    commitment: "confirmed",
  }
);

export const METAPLEX_READAPI =
  "https://devnet.helius-rpc.com/?api-key=78065db3-87fb-431c-8d43-fcd190212125";

// Here you can basically use what ever seed you want. For example one per level or city or whatever.
export const GAME_DATA_SEED = "level_2";

// Cookie game program ID
export const PROGRAM_ID = new PublicKey(IDL.address);

export function getProgram(provider: AnchorProvider) {
  return new Program(IDL as Cookie, provider);
}

export function useAnchorProvider() {
  const { connection } = useConnection();
  const wallet = useWallet();

  // Memoize provider to prevent recreating on every render
  return useMemo(
    () =>
      new AnchorProvider(connection, wallet as AnchorWallet, {
        commitment: "confirmed",
      }),
    [connection, wallet]
  );
}

// Hook to get memoized program instance
export function useProgram() {
  const provider = useAnchorProvider();

  // Memoize program to prevent recreating on every render
  return useMemo(() => new Program(IDL as Cookie, provider), [provider]);
}

export const [gameDataPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from(GAME_DATA_SEED, "utf8")],
  PROGRAM_ID
);

// Player Data Account Type from Idl
export type PlayerData = IdlAccounts<Cookie>["playerData"];
export type GameData = IdlAccounts<Cookie>["gameData"];

// Constants for the game
export const TIME_TO_REFILL_ENERGY: BN = new BN(60);
export const MAX_ENERGY = 100;
export const ENERGY_PER_TICK: BN = new BN(1);
export const TOTAL_WOOD_AVAILABLE: BN = new BN(100000);
