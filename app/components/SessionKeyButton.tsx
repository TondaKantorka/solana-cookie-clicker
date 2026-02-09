import { useState, useEffect } from "react";
import { Button } from "@chakra-ui/react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useSessionWallet } from "@magicblock-labs/gum-react-sdk";
import { useGameState } from "@/contexts/GameStateProvider";
import { PROGRAM_ID } from "@/utils/anchor";
import { PublicKey } from "@solana/web3.js";

const SessionKeyButton = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { gameState } = useGameState();
  const sessionWallet = useSessionWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [sessionExists, setSessionExists] = useState(false);

  // Verify if session token actually exists on-chain
  useEffect(() => {
    const verifySessionOnChain = async () => {
      if (!sessionWallet?.sessionToken || !connection) {
        setSessionExists(false);
        return;
      }

      try {
        // Convert sessionToken to PublicKey if it's a string
        let sessionTokenPubkey: PublicKey;
        if (typeof sessionWallet.sessionToken === "string") {
          sessionTokenPubkey = new PublicKey(sessionWallet.sessionToken);
        } else if ((sessionWallet.sessionToken as object) instanceof PublicKey) {
          sessionTokenPubkey = sessionWallet.sessionToken as PublicKey;
        } else {
          console.log("Session token is not a valid PublicKey or string");
          setSessionExists(false);
          return;
        }

        // Try to fetch the session token account
        const accountInfo = await connection.getAccountInfo(sessionTokenPubkey);

        if (accountInfo && accountInfo.data.length > 0) {
          // Session account exists on-chain
          setSessionExists(true);
        } else {
          // Session token is in browser but not on-chain - clear it
          console.log("Session token in browser but not on-chain, clearing...");
          setSessionExists(false);
          // The session wallet should handle this, but we update our local state
        }
      } catch (error) {
        console.error("Error verifying session on-chain:", error);
        setSessionExists(false);
      }
    };

    verifySessionOnChain();
  }, [sessionWallet?.sessionToken, connection]);

  const handleCreateSession = async () => {
    setIsLoading(true);
    const topUp = true;
    const expiryInMinutes = 600;

    try {
      const session = await sessionWallet.createSession(
        PROGRAM_ID,
        topUp ? 10000000 : 0,
        expiryInMinutes
      );
      console.log("Session created:", session);
      setSessionExists(true);
    } catch (error) {
      console.error("Failed to create session:", error);
      setSessionExists(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeSession = async () => {
    setIsLoading(true);
    try {
      await sessionWallet.revokeSession();
      sessionWallet.sessionToken = null;
      setSessionExists(false);
      console.log("Session revoked " + sessionWallet.publicKey);
    } catch (error) {
      console.error("Failed to revoke session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!publicKey || !gameState) {
    return null;
  }

  // Show Create button if no session token in browser OR session doesn't exist on-chain
  const shouldShowCreate = !sessionWallet?.sessionToken || !sessionExists;

  return (
    <>
      <Button
        isLoading={isLoading}
        onClick={shouldShowCreate ? handleCreateSession : handleRevokeSession}
      >
        {shouldShowCreate ? "Create Session" : "Revoke Session"}
      </Button>
    </>
  );
};

export default SessionKeyButton;
