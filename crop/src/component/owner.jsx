import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Web3Context } from "../component/Web3Context";
import { ChevronLeft, RefreshCw, Truck, Clock, Shield, User, Users, Package } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

function OwnerDashboard() {
  const [pdata, setPdata] = useState("");
  const [tdata, setTdata] = useState("");
  const [sdata, setSdata] = useState("");
  const [qdata, setQdata] = useState("");
  const [cropId, setCropId] = useState("");
  const [farmer, setFarmer] = useState("");
  const [user_add, setUser_add] = useState("");
  const [accessInfo, setAccessInfo] = useState(null);

  const { contract, account, owner } = useContext(Web3Context);

  const updateCropData = async (field, value) => {
    const loadingToast = toast.loading("Processing...");
    try {
      const tx=await contract.updateCropData(cropId, field, value);
      await tx.wait();
      toast.dismiss(loadingToast);
      toast.success("Crop Updation successful! 🎉")
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      let errorMessage = "⛔ Oops! Something went wrong!";
            toast.dismiss(loadingToast);
            toast.error(errorMessage);
    }
    finally {
          toast.dismiss(loadingToast);
        }
  };

  const allowAccess = async () => {
    if (account.toLowerCase() !== owner.toLowerCase()) {
      toast.error("Only the owner can give access");
      return;
    }
    const loadingToast = toast.loading("Processing...");
    try {
      const tx =await contract.allow(user_add);
       await tx.wait();
      toast.dismiss(loadingToast);
      toast.success("Access given successfully! 🎉");
    } catch (error) {
      console.log("Error giving access",error);
      toast.dismiss(loadingToast);
      let errorMessage = "⛔ Oops! rror giving access!";
      toast.error(errorMessage);
    }
  };

  const farmer_info = async (f_add) => {
    const acc_access = await contract.accesslist(account);
    const isAuthorized = account.toLowerCase() === owner.toLowerCase() || acc_access;
    if (!isAuthorized) {
      toast.error("Access is not allowed.");
      return;
    }
    const loadingToast = toast.loading("Processing...");
    try {
      const info = await contract.farmerInfo(f_add);
      toast.dismiss(loadingToast);
      toast.success(`Name: ${info.name}`);
    } catch (error) {
      console.error("Error fetching farmer:", error);
      toast.dismiss(loadingToast);
      toast.error("An error occurred while fetching farmer information.");
    }
  };

  const distributor_info = async (f_add) => {
    const acc_access = await contract.accesslist(account);
    const isAuthorized = account.toLowerCase() === owner.toLowerCase() || acc_access;
    if (!isAuthorized) {
      toast.error("Access is not allowed.");
      return;
    }
    const loadingToast = toast.loading("Processing...");
    try {
      const info = await contract.distributorInfo(f_add);
      toast.dismiss(loadingToast);
      toast.success(`Name: ${info.name}`);
    } catch (error) {
      console.error("Error fetching farmer:", error);
      toast.dismiss(loadingToast);
      toast.error("An error occurred while fetching farmer information.");
    }
  };
  const merchant_info = async (f_add) => {
    const acc_access = await contract.accesslist(account);
    const isAuthorized = account.toLowerCase() === owner.toLowerCase() || acc_access;
    if (!isAuthorized) {
      toast.error("Access is not allowed.");
      return;
    }
    const loadingToast = toast.loading("Processing...");
    try {
      const info = await contract.merchantInfo(f_add);
      toast.dismiss(loadingToast);
      toast.success(`Name: ${info.name}`);
    } catch (error) {
      console.error("Error fetching farmer:", error);
      toast.dismiss(loadingToast);
      toast.error("An error occurred while fetching farmer information.");
    }
  };
  const crop_acc = async (id) => {
    const acc_access = await contract.accesslist(account);
    const isAuthorized = account.toLowerCase() === owner.toLowerCase() || acc_access;
    if (!isAuthorized) {
      alert("Only the owner can perform this action.");
      return;
    }
    const loadingToast = toast.loading("Processing...");
    try {
      const info = await contract.accounts(id);
      toast.dismiss(loadingToast);
      toast.success(`Farmer: ${info.farmer}\nDistributor: ${info.distributor}\nMerchant: ${info.merchant}`);
    } catch (error) {
      console.error(`Error fetching crop accounts:`, error);
      toast.dismiss(loadingToast);
      toast.error("Access Denied!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-6">
      <div> <Toaster position="top-center" reverseOrder={false} /></div>
      <Link to="/" className="inline-flex items-center text-green-600 hover:text-green-700 transition-colors duration-200 mb-8">
        <ChevronLeft className="h-5 w-5 mr-1" />
        Back to Home
      </Link>

      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Owner Dashboard</h2>
          
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Account:</p>
              <p className="font-mono text-gray-800">{account}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Owner:</p>
              <p className="font-mono text-gray-800">{owner}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Crop Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="number"
                  placeholder="Crop ID"
                  value={cropId}
                  onChange={(e) => setCropId(e.target.value)}
                  className="border p-2 rounded w-full"
                />
                <button 
                  onClick={() => crop_acc(cropId)} 
                  className="flex items-center justify-center gap-2 bg-indigo-500 text-white p-2 rounded hover:bg-indigo-600 transition"
                >
                  <Package className="h-5 w-5" />
                  View Crop Info
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Pesticide Data"
                  value={pdata}
                  onChange={(e) => setPdata(e.target.value)}
                  className="border p-2 rounded w-full"
                />
                <button 
                  onClick={() => updateCropData("pesticideData", pdata)} 
                  className="flex items-center justify-center gap-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
                >
                  <RefreshCw className="h-5 w-5" />
                  Update Pesticide Data
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Transport Data"
                  value={tdata}
                  onChange={(e) => setTdata(e.target.value)}
                  className="border p-2 rounded w-full"
                />
                <button 
                  onClick={() => updateCropData("transportationStatus", tdata)} 
                  className="flex items-center justify-center gap-2 bg-purple-500 text-white p-2 rounded hover:bg-purple-600 transition"
                >
                  <Truck className="h-5 w-5" />
                  Update Transportation Status
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Shelf Life Data"
                  value={sdata}
                  onChange={(e) => setSdata(e.target.value)}
                  className="border p-2 rounded w-full"
                />
                <button 
                  onClick={() => updateCropData("shelfLifeData", sdata)} 
                  className="flex items-center justify-center gap-2 bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
                >
                  <Clock className="h-5 w-5" />
                  Update Shelf Life Data
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Quality Check"
                  value={qdata}
                  onChange={(e) => setQdata(e.target.value)}
                  className="border p-2 rounded w-full"
                />
                <button 
                  onClick={() => updateCropData("qualityCheck", qdata)} 
                  className="flex items-center justify-center gap-2 bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition"
                >
                  <Shield className="h-5 w-5" />
                  Update Quality Check
                </button>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Supply Chain Participants</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Address"
                  value={farmer}
                  onChange={(e) => setFarmer(e.target.value)}
                  className="border p-2 rounded w-full md:col-span-2"
                />
                <button 
                  onClick={() => farmer_info(farmer)} 
                  className="flex items-center justify-center gap-2 bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
                >
                  <User className="h-5 w-5" />
                  Fetch Farmer Info
                </button>
                <button 
                  onClick={() => distributor_info(farmer)} 
                  className="flex items-center justify-center gap-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
                >
                  <Truck className="h-5 w-5" />
                  Distributor Info
                </button>
                <button 
                  onClick={() => merchant_info(farmer)} 
                  className="flex items-center justify-center gap-2 bg-purple-500 text-white p-2 rounded hover:bg-purple-600 transition md:col-span-2"
                >
                  <Users className="h-5 w-5" />
                  Merchant Info
                </button>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Access Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="User Address"
                  value={user_add}
                  onChange={(e) => setUser_add(e.target.value)}
                  className="border p-2 rounded w-full md:col-span-2"
                />
                <button 
                  onClick={allowAccess} 
                  className="flex items-center justify-center gap-2 bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
                >
                  <Shield className="h-5 w-5" />
                  Allow Access
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OwnerDashboard;