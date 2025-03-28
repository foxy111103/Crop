import React, { useContext, useState } from "react";
import { Web3Context } from "../component/Web3Context";

const HomePage = () => {
  const { web3, contract, account } = useContext(Web3Context);
  const roleOptions = ["Farmer", "Distributor", "Merchant"];
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  const registerRole = async (roleIndex) => {
    if (!name.trim() || !location.trim()) {
      alert("Name and location cannot be empty.");
      return;
    }

    try {
      const receipt = await contract.methods.registerRole(roleIndex, name, location).send({
        from: account,
        gas: 3000000,
      });

      console.log("Transaction receipt:", receipt);
      alert(`Registered as ${roleOptions[roleIndex - 1]}`);
    } catch (error) {
      console.error("Error registering role:", error);

      if (error.data) {
        console.error("EVM revert reason:", error.data);
      }

      alert("Failed to register role. Check inputs or contract conditions.");
    }
  };

  const depositFunds = async () => {
    try {
      await contract.methods.depositFunds().send({
        from: account,
        value: web3.utils.toWei("0.01", "ether"),
      });
      alert("Funds deposited successfully!");
    } catch (error) {
      console.error("Error depositing funds:", error);
      alert("Failed to deposit funds.");
    }
  };

  return (
    <div>
      <h1>Home Page</h1>
      <p>Account: {account}</p>

      <input
        type="text"
        placeholder="Enter name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />

      {roleOptions.map((role, index) => (
        <button key={index} onClick={() => registerRole(index + 1)}>
          Register as {role}
        </button>
      ))}

      <h2>Deposit Funds</h2>
      <button onClick={depositFunds}>Deposit 0.01 ETH</button>
    </div>
  );
};

export default HomePage;
 