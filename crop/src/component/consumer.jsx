import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { Web3Context } from "../component/Web3Context";
import { ChevronLeft, Search, QrCode } from "lucide-react";
import qrcode from "qrcode";
import { Toaster, toast } from "react-hot-toast";
import logo from '../../src/logo.png';

const ConsumerDashboard = () => {
  const { contract, account } = useContext(Web3Context);
  const [cropId, setCropId] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [cropDetails, setCropDetails] = useState(null);
   const [isModalOpen, setIsModalOpen] = useState(false);

  // const fetchCropDetails = async () => {
  //    const loadingToast = toast.loading("Processing...");
  //   try {
  //     const crop = await contract.getCrop(cropId);
  //     setCropDetails(crop);
  //     toast.dismiss(loadingToast);
  //     //toast.success("Crop Updation successful! 🎉")
  //     toast.success(`Crop ID: ${crop.id}\nFarmer: ${crop.farmer}\nHealth Score: ${crop.healthScore}\nVerification Status: ${["Pending", "Approved", "Rejected"][crop.status]}`);
  //   } catch (error) {
  //     console.error("Error fetching crop details:", error);
  //     alert("Error fetching crop details. Please check the ID and try again.");
  //   }
  // };

  const getQr = async () => {
    const loadingToast = toast.loading("Processing...");
    try {
      const crop = await contract.getCrop(cropId);
      const qrText = `
        Crop ID: ${crop?.id || "N/A"}
        Health Score: ${crop?.healthScore || "N/A"}
        Farmer: ${crop?.farmer || "N/A"}
        Distributor: ${crop?.distributor || "N/A"}
        Merchant: ${crop?.merchant || "N/A"}
        Status: ${["Pending", "Approved", "Rejected"][crop?.status] || "N/A"}
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-6">
       <div>
              <Toaster position="top-center" reverseOrder={false} />
                </div>
      <Link to="/" className="inline-flex items-center text-green-600 hover:text-green-700 transition-colors duration-200 mb-8">
        <ChevronLeft className="h-5 w-5 mr-1" />
        Back to Home
      </Link>

      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Consumer Dashboard</h2>
          
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Account:</p>
              <p className="font-mono text-gray-800">{account}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-4">Fetch Crop Details</h3>
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="number"
                  value={cropId}
                  onChange={(e) => setCropId(e.target.value)}
                  placeholder="Enter Crop ID"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
               
              </div>
            </div>

            {cropDetails && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-4">Crop Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <p className="text-sm text-gray-600">Crop ID:</p>
                    <p className="font-medium text-gray-800">{cropDetails.id}</p>
                  </div>
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <p className="text-sm text-gray-600">Health Score:</p>
                    <p className="font-medium text-gray-800">{cropDetails.healthScore}</p>
                  </div>
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <p className="text-sm text-gray-600">Farmer:</p>
                    <p className="font-medium text-gray-800 truncate">{cropDetails.farmer}</p>
                  </div>
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <p className="text-sm text-gray-600">Status:</p>
                    <p className="font-medium text-gray-800">
                      {["Pending", "Approved", "Rejected"][cropDetails.status]}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-4">Generate QR Code</h3>
              <button 
                onClick={getQr}
                className="w-full bg-green-600 text-white p-3 rounded-md hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <QrCode className="h-5 w-5" />
                Generate QR
              </button>
              
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsumerDashboard;