import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Youtube, Linkedin } from 'lucide-react';
import FarmerDashboard from './component/farmer';
import DistributorDashboard from './component/distributer';
import MerchantPage from './component/marchent';
import { Web3Provider } from './component/Web3Context';
import { Web3Context } from './component/Web3Context';
import { useContext } from 'react';
import { ethers } from 'ethers';
import { User } from 'lucide-react';
import { useState } from 'react';
import { Toaster, toast } from "react-hot-toast";
import OwnerDashboard from './component/owner';
import ConsumerDashboard from './component/consumer';



function App() {
  
return (
    <Web3Provider>
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/farmer" element={<FarmerDashboard />} />
        <Route path="/distributor" element={<DistributorDashboard />} />
        <Route path="/merchant" element={<MerchantPage />} />
        <Route path="/owner" element={<OwnerDashboard/>}/>
        <Route path="/consumer" element={<ConsumerDashboard/>}/>
      </Routes>
    </Router>
    </Web3Provider>
  );
}

function HomePage() {
  
  const [showOwnerAccount, setShowOwnerAccount] = useState(false);
  const [showConsumerAccount, setShowConsumerAccount] = useState(false);
  const { contract, account, error,signer } = useContext(Web3Context);
  const eth=0.1;
  const amount =eth.toString();
  const Deposit = async () => {
    const loadingToast = toast.loading("Processing...");
    try {
      console.log(contract);
      await contract.depositFunds({
        value: ethers.utils.parseEther(amount)
      });
       toast.dismiss(loadingToast);
       toast.success("Amount Deposited Successfully! 🎉");
    }
    catch (error) {
      toast.dismiss(loadingToast);
      console.error("Error depositing funds:", error); 
      toast.error("Transaction Rejected!");
    }
  };
  const handleClick = () => {
    window.location.href = "https://quamin.in/"
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
       <div>
            <Toaster position="top-center" reverseOrder={false} />
          </div>
      {/* Navigation */}
      <nav className="px-6 py-4 flex items-center justify-between bg-green-300"> 
      <div className="flex items-center gap-2" onClick={handleClick} style={{ cursor: "pointer" }} title="Welcome To QuaMin"> 
        <img src="src/Quaminlogo.png" alt="Quamin Logo" className="h-8 w-8 object-contain" /> 
        <span className="text-xl font-semibold text-black">QuaMin</span> 
      </div>
      
      <div className="flex gap-3">
          <Link 
            to="/owner"
            className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            Owner Account
          </Link>
          <Link 
            to="/consumer"
            className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            Consumer Account
          </Link>
          </div>
    </nav>

      {/* Hero Section */}
      <header className="text-center px-4 py-20">
        <h1 className="text-5xl font-bold text-green-600 mb-6">Blockchain-Powered Agriculture</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Connect Farmers, Distributors, and Merchants. Secure transactions. Build trust in agriculture supply chains.
        </p>
      </header>
      <div 
    className="fixed bottom-9 right-4 bg-white p-4 rounded-full shadow-md cursor-pointer z-50 hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
      onClick={Deposit}
      title="Deposit Ethereum"
    >
      <img src='src/etherium.png' className="w-15 h-20 object-contain" alt="Ethereum" />
    </div>
      {/* Dashboard Cards */}
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Farmer Dashboard */}
        <Link to="/farmer" className="bg-white p-8 rounded-2xl shadow-lg hover:bg-green-300 focus:bg-green-300 transition">
          <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-6">
          <span className="card-icon text-green-600 text-xl">🧑</span>
          <span className="card-icon text-green-600 text-xl">👨‍🌾</span>   
          </div>
          <h2 className="text-2xl font-semibold text-green-600 mb-4">
            Farmer Dashboard
          </h2>
          <p className="text-gray-600">
            Manage crops, track sales, and connect with distributors
          </p>
        </Link>

        {/* Distributor Dashboard */}
        <Link to="/distributor" className="bg-white p-8 rounded-2xl shadow-lg hover:bg-green-300 focus:bg-green-300 transition">
          <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-6">
          <span className="card-icon text-gray-600 text-xl">🚚</span>
          <span className="card-icon text-gray-600 text-xl">🧑‍💼</span>  
           
          </div>
          <h2 className="text-2xl font-semibold text-green-600 mb-4">
            Distributor Dashboard
          </h2>
          <p className="text-gray-600">
            Coordinate logistics and optimize supply chains
          </p>
        </Link>

        {/* Merchant Dashboard */}
        <Link to="/merchant" className="bg-white p-8 rounded-2xl shadow-lg hover:bg-green-300 focus:bg-green-300 transition">
          <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-6">
          <span className="card-icon text-green-600 text-2xl">💵</span>
          <span className="card-icon text-green-600 text-2xl">🏬</span>
          </div>
          <h2 className="text-2xl font-semibold text-green-600 mb-4">
            Merchant Dashboard
          </h2>
          <p className="text-gray-600">
            Source products and verify authenticity
          </p>
        </Link>
      </div>

      {/* Footer */}
      <footer className="bg-white mt-20 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center gap-2 mb-4 md:mb-0" onClick={handleClick} style={{ cursor: "pointer" }} title="Welcome To QuaMin">
            <img
                src="src/Quaminlogo.png"
                alt="Quamin Logo"
                className="h-8 w-8 object-contain"/>
              <span className="text-xl font-semibold text-green-600">QuaMin</span>
            </div>
            
           
            
          </div>
          <div className="flex justify-right gap-4">
            <a href="http://youtube.com/@quamintech" className="text-green-400 hover:text-green-600 transition">
              <Youtube className="h-6 w-6" />
            </a>
            <a href="https://www.linkedin.com/company/quamin/" className="text-green-400 hover:text-green-600 transition">
              <Linkedin className="h-6 w-6" />
            </a>
          </div>
          <div className="text-center mt-8 text-green-500">
            © 2025 Quamin. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
