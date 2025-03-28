import logo from '../../src/logo.png';
import React, { useState, useEffect,useContext } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft,BadgeCheck , QrCode, Truck,Phone, Mail, FileText, Search, CheckCircle, XCircle, User, Edit2 } from 'lucide-react';
import qrcode from 'qrcode';
import { ethers } from 'ethers';
import { Web3Context } from '../component/Web3Context';
import { Toaster, toast } from "react-hot-toast";

function DistributorDashboard() {
  const { contract, account, error,signer } = useContext(Web3Context);
  const [activeSection, setActiveSection] = useState('verify');
  const [cropId, setCropId] = useState('');
  const [verifiedCrop, setVerifiedCrop] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [distributorData, setDistributorData] = useState({
    companyName: '',
    licenseNumber: '',
    phoneNumber: '',
    emailAddress: '',
    serviceArea: ''
  });

  const DESTRIBUTER_ROLE = 2; 
  const shipments = [
    { id: 'SHP-001', crop: 'Wheat', quantity: '500kg', origin: 'Farm A', destination: 'Market B', status: 'In Transit', eta: '2024-06-15' },
    { id: 'SHP-002', crop: 'Corn', quantity: '750kg', origin: 'Farm C', destination: 'Market D', status: 'Delivered', eta: '2024-06-10' },
    { id: 'SHP-003', crop: 'Rice', quantity: '300kg', origin: 'Farm B', destination: 'Market A', status: 'Pending', eta: '2024-06-20' },
  ];

useEffect(() => {
  const CheckDistributorStatus = async () => {
    if (contract && account) {
      try {
        // Check if there's a specific method to check roles
        // Example: Try using a view function if available
        //let isRegisteredAsFarmer;
        
          // If that fails, try the original approach
        const role = await contract.roles(account);

        console.log(role);
        
        
        if (role==2) {
          try {
            // Get the farmer info
            const info = await contract.distributorInfo(account);
            console.log(info);
            setDistributorData({
              companyName: info.name,
              serviceArea: info.area,
              licenseNumber:info.license_no,
              phoneNumber:info.phone_no,
              emailAddress:info.email_add,
              serviceArea:info.area
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

  CheckDistributorStatus();
}, [contract, account]);

  const handleSubmit = async(e) => {
    e.preventDefault();
    setIsLoading(true);
    const loadingToast = toast.loading("Processing...");
    try {
      const tx = await contract.DistributorRegister(
        DESTRIBUTER_ROLE,
        distributorData.companyName,
        distributorData.serviceArea,
        distributorData.emailAddress,
        distributorData.phoneNumber,
        distributorData.licenseNumber,

        { gasLimit: 3000000 }

      );
  
      await tx.wait();
      localStorage.removeItem("isReloaded");
      toast.dismiss(loadingToast);
      toast.success("Registration successful! 🎉");
      setIsRegistered(true);
      setIsEditing(false);
      setActiveSection('verify');
    } catch (error) {
      console.error("Registration error:", error);
      toast.dismiss(loadingToast);
      let errorMessage = "⛔ Oops! Something went wrong!";
      toast.error(errorMessage);
   } finally {
      toast.dismiss(loadingToast);
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDistributorData({
      ...distributorData,
      [name]: value
    });
  };

  const handleCropVerification =async (e) => {
    e.preventDefault();
    const crop= await contract.crops(cropId);
    if (crop.distributor == "") {
      const loadingToast = toast.loading("Processing...");
      try{
        const tx= await contract.verifyCrop(cropId, { gasLimit: 3000000 });
        await tx.wait();
        setVerifiedCrop(crop);
        setVerificationStatus('success');
        toast.dismiss(loadingToast);
        toast.success("Crop verification successful! 🎉");
      }
      catch(e){
        console.log(e);
        setVerifiedCrop(null);
      setVerificationStatus('error');
      toast.dismiss(loadingToast);
      toast.error("Error: Verification failed. Please try again.");
      }
    } 
    else{
      toast.success("Crop is already verified! 🎉");
      setVerifiedCrop(crop);
      setVerificationStatus('success');
    }
  };
  // When you receive the verified crop data from your contract

// Then when you get data from the contract:
    const getQr = async() => {
      const loadingToast = toast.loading("Processing...");
      try{
           const crop = await contract.getCrop(cropId);
           console.log(crop);
           const qrText = `
             Crop ID: ${crop?.id || "N/A"}
             Health Score: ${crop?.healthScore || "N/A"}
             Farmer: ${crop?.farmer || "N/A"}
             Distributor: ${crop?.distributor || "N/A"}
             Merchant: ${crop?.merchant || "N/A"}
             Status: ${crop?.status || "N/A"}
             Pesticide Data: ${crop?.pesticideData || "N/A"}
             Transportation Status: ${crop?.transportationStatus || "N/A"}
             Shelf Life Data: ${crop?.shelfLifeData || "N/A"}
             Quality Check: ${crop?.qualityCheck || "N/A"}
             Feedback: ${crop?.feedback || "N/A"}
             Tampering Checked: ${crop?.tamperingChecked ? "Yes" : "No"}
           `;
       
           const canvas = document.createElement('canvas');
            qrcode.toCanvas(canvas, qrText, { width: 300 }, (error) => {
              if (error) console.error(error);
        
              const ctx = canvas.getContext('2d');
              const image = new Image();
              image.src = logo;
        
              image.onload = () => {
                const logoSize = 50;
                const xPos = (canvas.width - logoSize) / 2;
                const yPos = (canvas.height - logoSize) / 2;
        
                ctx.drawImage(image, xPos, yPos, logoSize, logoSize);
                const url = canvas.toDataURL();
                setQrCodeUrl(url);
                setIsModalOpen(true);
                toast.dismiss(loadingToast);
                toast.success("Qr Generated Successfully! 🎉");
             };
           });
           }
           catch(error){
              toast.dismiss(loadingToast);
              console.error("Error Generating Qr:", error); 
              toast.error("Error Generating Qr!");
           }
         };
  
  const renderRegistrationForm = () => (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Distributor Registration</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
          <input
            type="text"
            name="companyName"
            value={distributorData.companyName}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
          <input
            type="text"
            name="licenseNumber"
            value={distributorData.licenseNumber}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <input
            type="tel"
            name="phoneNumber"
            value={distributorData.phoneNumber}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            name="emailAddress"
            value={distributorData.emailAddress}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
            required
          />
        </div>


        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Service Area</label>
          <input
            type="text"
            name="serviceArea"
            value={distributorData.serviceArea}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
            required
          />
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 active:bg-green-800 transform hover:scale-[1.02] transition-all duration-200"
          >
            {isEditing ? 'Save Changes' : 'Register as Distributor'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderDistributorDetails = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Distributor Details</h2>
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 active:bg-green-800 transform hover:scale-[1.02] transition-all duration-200"
        >
          <Edit2 className="h-5 w-5 mr-2" />
          Edit Profile
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <User className="h-5 w-5 text-green-600" />
          <p className="text-sm text-gray-500">Company Name</p>
          <p className="font-medium">{distributorData.companyName}</p>
        </div>
        <div>
        <BadgeCheck className="h-5 w-5 text-green-600" />
          <p className="text-sm text-gray-500">License Number</p>
          <p className="font-medium">{distributorData.licenseNumber}</p>
        </div>
        <div>
        <Phone className="h-5 w-5 text-green-600" />
          <p className="text-sm text-gray-500">Phone Number</p>
          <p className="font-medium">{distributorData.phoneNumber}</p>
        </div>
        <div>
        <Mail className="h-5 w-5 text-green-600" />
          <p className="text-sm text-gray-500">Email Address</p>
          <p className="font-medium">{distributorData.emailAddress}</p>
        </div>
        <div>
          <Truck className="h-5 w-5 text-green-600" />
          <p className="text-sm text-gray-500">Service Area</p>
          <p className="font-medium">{distributorData.serviceArea}</p>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (activeSection === 'register') {
      return isEditing || !isRegistered ? renderRegistrationForm() : renderDistributorDetails();
    }

    switch (activeSection) {
      case 'verify':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Verify Crop</h2>
            
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={cropId}
                  onChange={(e) => setCropId(e.target.value)}
                  placeholder="Enter Crop ID or Scan QR Code"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                />
                <button 
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 active:bg-green-800 transform hover:scale-[1.02] transition-all duration-200" onClick={handleCropVerification}
                >
                  Verify
                </button>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 active:bg-blue-800 transform hover:scale-[1.02] transition-all duration-200" onClick={getQr}>
                Generate QR
              </button>
              </div>

              {verificationStatus === 'success' && verifiedCrop && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                    <h3 className="text-lg font-medium text-green-800">Crop Verified Successfully</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Crop ID</p>
                      <p className="font-medium">{verifiedCrop.id.toString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Health Score</p>
                      <p className="font-medium">{verifiedCrop.healthScore.toString()}/100</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Farmer</p>
                      <p className="font-medium">{verifiedCrop.farmer}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Distributor</p>
                      <p className="font-medium">{verifiedCrop.distributor}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-medium">{verifiedCrop.status===0?"Pending":verifiedCrop.status===1?"Accepted":"Rejected"}</p>
                    </div>
                  </div>
                  </div>
                )}

              {verificationStatus === 'error' && (
                <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center">
                    <XCircle className="h-6 w-6 text-red-600 mr-2" />
                    <div>
                      <h3 className="text-lg font-medium text-red-800">Verification Failed</h3>
                      <p className="text-sm text-red-600 mt-1">
                        The crop ID could not be verified. Please check the ID and try again.
                      </p>
                    </div>
                  </div>
                </div>
              )}
          
          </div>
        );
     
      case 'track':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Track Location</h2>
            <div className="space-y-4">
              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder="Enter Shipment ID"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                />
                <button className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 active:bg-green-800 transform hover:scale-[1.02] transition-all duration-200">
                  Track
                </button>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-600">Enter a shipment ID to view its current location and status</p>
              </div>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="p-4 border border-gray-200 rounded-md hover:bg-green-50 hover:border-green-500 transform hover:scale-[1.02] transition-all duration-200">
                <FileText className="h-6 w-6 text-green-600 mb-2" />
                <h3 className="font-medium">Shipment Report</h3>
                <p className="text-sm text-gray-500">Download detailed shipment reports</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-md hover:bg-green-50 hover:border-green-500 transform hover:scale-[1.02] transition-all duration-200">
                <Search className="h-6 w-6 text-green-600 mb-2" />
                <h3 className="font-medium">Analytics Report</h3>
                <p className="text-sm text-gray-500">View shipment analytics and trends</p>
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-6">
       <div>
        <Toaster position="top-center" reverseOrder={false} />
          </div>
      <Link to="/" className="inline-flex items-center text-green-600 hover:text-green-700 transition-colors duration-200 mb-8">
        <ChevronLeft className="h-5 w-5 mr-1" />
        Back to Home
      </Link>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-green-600 mb-4">Distributor Dashboard 🚚</h1>
        <p className="text-gray-600 mb-8">
          Join in our Distribution for better income.
        </p>
        </div>


      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <nav className="space-y-2">
              <button
                onClick={() => setActiveSection('register')}
                className={`flex items-center w-full space-x-2 p-2 rounded-md transition-all duration-200 transform hover:scale-[1.02] ${
                  activeSection === 'register'
                    ? 'text-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                <User className="h-5 w-5" />
                <span>Registration</span>
              </button>
              <button
                onClick={() => setActiveSection('verify')}
                className={`flex items-center w-full space-x-2 p-2 rounded-md transition-all duration-200 transform hover:scale-[1.02] ${
                  activeSection === 'verify'
                    ? 'text-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                <QrCode className="h-5 w-5" />
                <span>Verify Crops</span>
              </button>
              
            </nav>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3 space-y-6">
            {renderContent()}
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-xl font-bold mb-4">Crop QR Code</h2>
            <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 mx-auto border rounded-md" />
            <div className="mt-4">
              <a
                href={qrCodeUrl}
                download={`Crop-${cropId}.png`}
                className="bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Download QR Code
              </a>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-red-600 text-white px-4 py-2 ml-4 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DistributorDashboard;
