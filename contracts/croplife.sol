// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Crop_life {
    address public  owner;

    constructor() {
        owner = msg.sender;
    }

    // Enums for role and status
    enum Role { None, Farmer, Distributor, Merchant }
    enum CropStatus { Pending, Approved, Rejected }

    // Struct for crop (optimized with struct packing)
    struct Crop {
        uint256 id;
        uint256 healthScore;
        string farmer;
        string distributor;
        string merchant;
        CropStatus status;
        string pesticideData;
        string transportationStatus;
        string shelfLifeData;
        string qualityCheck;
        string feedback;
        bool tamperingChecked;
    }

    struct Crop_add {
        address farmer;
        address merchant;
        address distributor;
    }

    struct Farmer {
        string name; 
        string phone_no;
        string email;
        string primary_crops;
        string farmsize;
        string field_location;
    }

    struct Merchant {
        string name;
        string business;
        string license;
        string email;
        string phone;
        string Taxid;
        string area;
    }

    struct Distributor {
        string name;
        string license_no;
        string phone_no;
        string email_add;
        string area;
    }
    struct Access{
        bool access;//t or f

    }

    
    mapping(uint256 => Crop) public crops; // Crop mapping
    mapping(address => Role) public roles; // Roles for access control
    mapping(uint256 => Crop_add) public accounts; // Crop accounts mapping
    mapping(address => Farmer) public farmerInfo;
    mapping(address => Merchant) public merchantInfo;
    mapping(address => Distributor) public distributorInfo;

    mapping (address=>Access) public accesslist;
    
    uint256 public cropCount = 0;
    uint256 public constant MIN_HEALTH_SCORE = 70;
    uint256 public rewardAmount = 0.001 ether;

    
    event CropCreated(uint256 cropId, address farmer, uint256 healthScore);
    event CropVerified(uint256 cropId, address verifier, bool approved);
    event DataUpdated(uint256 cropId, string dataField, string newValue);
    event FeedbackProvided(uint256 cropId, string feedback);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner , "Unauthorized: Only the owner can do this");
        _;
    }

    modifier onlyRole(Role _role) {
        require(roles[msg.sender] == _role, "Unauthorized: Wrong role");
        _;
    }

    modifier cropExists(uint256 _cropId) {
        require(_cropId <= cropCount, "Crop does not exist");
        _;
    }
    function allow(address user) external onlyOwner {
        require(accesslist[user].access==false,"User already allowed");
        accesslist[user].access=true;
        }

    function disallow(address user) public  onlyOwner onlyRole(Role.None){
       require(accesslist[user].access==true,"User already not allowed");
       accesslist[user].access=false;
    }
    // Register a role for a user
    function DistributorRegister(Role _role, string memory _name, string memory _loc,string memory _email,string memory _phone,string memory _license) external {
        require(roles[msg.sender] == Role.None, "Role already assigned");
        roles[msg.sender] = _role;
         distributorInfo[msg.sender] = Distributor(_name,_license,_phone,_email,_loc);
    }
    function FarmerRegister(Role _role, string memory _name,string memory _farmsize, string memory _loc,string memory _email,string memory _phone,string memory _crop) external {
        require(roles[msg.sender] == Role.None, "Role already assigned");
        roles[msg.sender] = _role;
         farmerInfo[msg.sender] = Farmer(_name,_crop,_phone,_email,_farmsize,_loc);
    }
    function MarchentRegister(Role _role, string memory _name, string memory _business,string memory _license,string memory _email,string memory _phone,string memory _taxid,string memory _loc) external {
        require(roles[msg.sender] == Role.None, "Role already assigned");
        roles[msg.sender] = _role;
        merchantInfo[msg.sender] = Merchant(_name,_business,_license,_email,_phone,_taxid,_loc);   
    }
    function EditFarmer(Role _role, string memory _name,string memory _farmsize, string memory _loc,string memory _email,string memory _phone,string memory _crop) external {
        require(roles[msg.sender] == Role.Farmer , "Role is not assigned as farmer");
        roles[msg.sender] = _role;
        farmerInfo[msg.sender] = Farmer(_name,_crop,_phone,_email,_farmsize,_loc);
        
    }
    function EditDistributor(string memory _name, string memory _loc,string memory _email,string memory _phone,string memory _license)external {
        require(roles[msg.sender] == Role.Distributor, "Role is not assigned as Distributor");
        distributorInfo[msg.sender] = Distributor(_name,_license,_phone,_email,_loc);
    }
    function EditMarchent(Role _role, string memory _name, string memory _business,string memory _license,string memory _email,string memory _phone,string memory _taxid,string memory _loc) external {
        require(roles[msg.sender] == Role.Merchant, "Role is not assigned as Marchent");
        roles[msg.sender] = _role;
        merchantInfo[msg.sender] = Merchant(_name,_business,_license,_email,_phone,_taxid,_loc);
        
    }
    // Create a crop
    function createCrop(uint256 _healthScore) external onlyRole(Role.Farmer) returns (uint256) {
        cropCount++;
        crops[cropCount] = Crop({
            id: cropCount,
            farmer: farmerInfo[msg.sender].name,
            distributor: "",
            merchant: "",
            healthScore: _healthScore,
            status: CropStatus.Pending,
            pesticideData: "",
            transportationStatus: "",
            shelfLifeData: "",
            qualityCheck: "",
            feedback: "",
            tamperingChecked: false
        });
        accounts[cropCount].farmer=msg.sender;


        emit CropCreated(cropCount, msg.sender, _healthScore);
        return cropCount;
    }

    // Update crop data
    function updateCropData(
        uint256 _cropId,
        string memory _field,
        string memory _value
    ) external cropExists(_cropId) onlyOwner {
        
        Crop storage crop = crops[_cropId];

        if (keccak256(abi.encodePacked(_field)) == keccak256(abi.encodePacked("pesticideData"))) {
            crop.pesticideData = _value;
        } else if (keccak256(abi.encodePacked(_field)) == keccak256(abi.encodePacked("transportationStatus"))) {
            crop.transportationStatus = _value;
        } else if (keccak256(abi.encodePacked(_field)) == keccak256(abi.encodePacked("shelfLifeData"))) {
            crop.shelfLifeData = _value;
        } else if (keccak256(abi.encodePacked(_field)) == keccak256(abi.encodePacked("qualityCheck"))) {
            crop.qualityCheck = _value;
        } else {
            revert("Invalid data field");
        }

        emit DataUpdated(_cropId, _field, _value);
    }

    // Add consumer feedback
    function addFeedback(uint256 _cropId, string memory _feedback) external cropExists(_cropId) {
        crops[_cropId].feedback = _feedback;
        emit FeedbackProvided(_cropId, _feedback);
    }

    // Verify crop by distributor or merchant
    function verifyCrop(uint256 _cropId) external cropExists(_cropId) {
        Crop storage crop = crops[_cropId];
        Role role = roles[msg.sender];

        require(
            (role == Role.Distributor && crop.status == CropStatus.Pending) ||
            (role == Role.Merchant && crop.status == CropStatus.Approved),
            "Unauthorized or invalid crop status"
        );

        if (role == Role.Distributor) {
            crop.distributor = distributorInfo[msg.sender].name;

            if (crop.healthScore >= MIN_HEALTH_SCORE) {
                crop.status = CropStatus.Approved;
                accounts[_cropId].distributor=msg.sender;
                payable(owner).transfer(rewardAmount); // Reward to owner
                emit CropVerified(_cropId, msg.sender, true);
            } else {
                crop.status = CropStatus.Rejected;
                emit CropVerified(_cropId, msg.sender, false);
            }
        } else if (role == Role.Merchant) {
            crop.merchant = merchantInfo[msg.sender].name;
            accounts[_cropId].merchant=msg.sender;
            if (crop.healthScore >= MIN_HEALTH_SCORE) {
                emit CropVerified(_cropId, msg.sender, true);
            }
        }
    }

    // Deposit funds for rewards
    function depositFunds() external payable {}

    // Get crop details
    function getCrop(uint256 _cropId) external view cropExists(_cropId) returns (Crop memory) {
        return crops[_cropId];
    }
   

}