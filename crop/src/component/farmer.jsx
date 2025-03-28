import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Web3Context } from '../component/Web3Context';
import { ChevronLeft, User, MapPin, Sprout, Phone, Mail } from 'lucide-react';
import { Toaster, toast } from "react-hot-toast";

function FarmerDashboard() {
  const { contract, account, error } = useContext(Web3Context);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [farmerData, setFarmerData] = useState({
    fullName: '',
    farmLocation: '',
    farmSize: '',
    primaryCrops: '',
    phoneNumber: '',
    emailAddress: '',
    healthScore: '',
  });
  
  const FARMER_ROLE = 1; // This matches the Role.Farmer in your contract

  // Check if the user is already registered as a farmer
 // Add error handling to improve debugging
useEffect(() => {
  console.log(contract);
  const checkFarmerStatus = async () => {
    if (contract && account) {
      try {
        // Check if there's a specific method to check roles
        // Example: Try using a view function if available
        //let isRegisteredAsFarmer;
        
          // If that fails, try the original approach
          const role = await contract.roles(account);

        console.log(role);
        
        
        if (role==1) {
          try {
            // Get the farmer info
            const info = await contract.farmerInfo(account);
            console.log(info);
            setFarmerData({
              fullName: info.name,
              phoneNumber: info.phone_no,
              emailAddress: info.email,
              primaryCrops: info.primary_crops,
              farmSize: info.farmsize,
              farmLocation: info.field_location
            });
            
            setIsRegistered(true);
          } catch (e) {
            console.error("Error fetching farmer info:", e);
          }
        }
      } catch (error) {
        console.error("Error checking farmer status:", error);
        // Don't stop the component from rendering
      }
    }
  };

  checkFarmerStatus();
}, [contract, account]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFarmerData({
      ...farmerData,
      [name]: value,
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const loadingToast = toast.loading("Processing...");
    try {
      const tx = await contract.FarmerRegister(
        FARMER_ROLE,
        farmerData.fullName,
        farmerData.farmSize,
        farmerData.farmLocation,
        farmerData.emailAddress,
        farmerData.phoneNumber,
        farmerData.primaryCrops,
        { gasLimit: 3000000 }
      );
  
      await tx.wait();
      setIsRegistered(true);
      console.log(farmerData);
      localStorage.removeItem("isReloaded");
      toast.dismiss(loadingToast);
      toast.success("Registration successful! 🎉");
    } catch (error) {
      console.error("Registration error:", error);
  
      // Capture exact error from the contract
      let errorMessage = "⛔ Oops! Something went wrong!";
      toast.dismiss(loadingToast);
      toast.error(errorMessage);
    } finally {
      toast.dismiss(loadingToast);
      setIsLoading(false);
    }
  };
  
  const createCrop = async () => {
    const loadingToast = toast.loading("Processing...");
    if (!isRegistered) {
      const message ="You must register as a farmer first.";
      toast.error(message);
      return;
    }
    
    const { healthScore } = farmerData;
    if (!healthScore || healthScore <= 0 || healthScore > 100) {
     const message ="Health score must be between 1 and 100.";
     toast.error(message);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call the createCrop function from the contract
      const tx = await contract.createCrop(parseInt(healthScore));
      
      // Wait for the transaction to be mined
      await tx.wait();
      
      toast.dismiss(loadingToast);
      toast.success("Crop Creation successful! 🎉");
    } catch (error) {
      console.error('Error creating crop:', error);
      toast.dismiss(loadingToast);
      toast.error("Crop Creation Failed");
    } finally {
      toast.dismiss(loadingToast);
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-6 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Connection Error</h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <p className="text-gray-600 mb-6">Please ensure MetaMask is installed and connected to the correct network.</p>
          <Link to="/" className="inline-flex items-center text-green-600 hover:text-green-700 transition-colors duration-200">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-6">
      <Toaster position="top-center" reverseOrder={false} />
      <Link to="/" className="inline-flex items-center text-green-600 hover:text-green-700 transition-colors duration-200 mb-8">
        <ChevronLeft className="h-5 w-5 mr-1" />
        Back to Home
      </Link>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-green-600 mb-4">Farmer Dashboard 👨‍🌾</h1>
        <p className="text-gray-600 mb-8">
          Join our blockchain agriculture network and start managing your farm digitally.
        </p>

        {!isRegistered ? (
          <div className="bg-white rounded-lg shadow-md p-8">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={farmerData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Farm Location</label>
                <input
                  type="text"
                  name="farmLocation"
                  value={farmerData.farmLocation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="Enter farm location"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Farm Size (in acres)</label>
                <input
                  type="number"
                  name="farmSize"
                  value={farmerData.farmSize}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="Enter farm size"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Crops</label>
                <input
                  type="text"
                  name="primaryCrops"
                  value={farmerData.primaryCrops}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="Enter primary crops"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={farmerData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="emailAddress"
                  value={farmerData.emailAddress}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="Enter email address"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 active:bg-green-800 transform hover:scale-[1.02] transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? 'Registering...' : 'Register as Farmer'}
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Note: Only Name and Farm Location are stored on the blockchain
                </p>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="mb-6">
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Farmer Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{farmerData.fullName}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Farm Location</p>
                  <p className="font-medium">{farmerData.farmLocation}</p>
                </div>
              </div>

              {farmerData.farmSize && (
                <div className="flex items-center space-x-3">
                  <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Farm Size</p>
                    <p className="font-medium">{farmerData.farmSize} acres</p>
                  </div>
                </div>
              )}

              {farmerData.primaryCrops && (
                <div className="flex items-center space-x-3">
                  <Sprout className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Primary Crops</p>
                    <p className="font-medium">{farmerData.primaryCrops}</p>
                  </div>
                </div>
              )}

              {farmerData.phoneNumber && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium">{farmerData.phoneNumber}</p>
                  </div>
                </div>
              )}

              {farmerData.emailAddress && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-medium">{farmerData.emailAddress}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Crop Health Score (1-100)</label>
                  <input
                    type="number"
                    name="healthScore"
                    value={farmerData.healthScore}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="Enter health score"
                    min="1"
                    max="100"
                  />
                </div>
                
                <button
                  onClick={createCrop}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 active:bg-green-800 transform hover:scale-[1.02] transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create New Crop'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FarmerDashboard;