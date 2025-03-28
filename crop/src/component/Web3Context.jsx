// Web3Context.jsx
import React, { createContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import ABI from "../../../artifacts/contracts/croplife.sol/Crop_life.json";
// Create the context
const Web3Context = createContext();


function Web3Provider({ children }) {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [owner, setOwner] = useState(null);
  const [networkName, setNetworkName] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;; // Ensure this is set in your .env file

  useEffect(() => {
    const initEthers = async () => {
      setIsLoading(true);
      setError(null);
      
      if (!window.ethereum) {
        setError("MetaMask is not installed!");
        setIsLoading(false);
        return;
      }

      try {
        // For ethers.js v5, use Web3Provider
        const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
        
        // Get network information
        const network = await ethersProvider.getNetwork();
        setNetworkName(network.name);
        
        // Request account access through MetaMask
        await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        // Get the signer
        const ethersSigner = ethersProvider.getSigner();
        
        // Get the connected account
        const accounts = await ethersProvider.listAccounts();
        const currentAccount = accounts[0];
        
        // Create contract instance
        const contractInstance = new ethers.Contract(
          contractAddress,
          ABI.abi,
          ethersSigner
        );

        // Check if contract exists by calling a view function
        try {
          // Try to get contract owner - wrap in try/catch to handle potential errors
          const contractOwner = await contractInstance.owner();
          setOwner(contractOwner);
        } catch (contractError) {
          console.warn("Could not fetch contract owner:", contractError);
          // Continue anyway - the contract might exist but not have an owner() function
        }
        
        setProvider(ethersProvider);
        setSigner(ethersSigner);
        setContract(contractInstance);
        setAccount(currentAccount);

        // Setup event listeners
        window.ethereum.on('accountsChanged', (newAccounts) => {
          setAccount(newAccounts[0] || null);
        });
        
        window.ethereum.on('chainChanged', () => {
          // Reload the page when network changes
          window.location.reload();
        });

      } catch (error) {
        console.error("Error initializing ethers:", error);
        setError(`Connection error: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    initEthers();

    // Clean up event listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  // Function to manually reconnect
  const reconnect = () => {
    initEthers();
  };

  return (
    <Web3Context.Provider value={{ 
      provider, 
      signer, 
      contract, 
      account, 
      owner, 
      networkName,
      error,
      isLoading,
      reconnect
    }}>
      {children}
    </Web3Context.Provider>
  );
}

// Export the context and provider
export { Web3Context, Web3Provider };