// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @title ComplianceEngine
 * @notice Peak-level compliance engine with UUPS upgradeability, RBAC, and comprehensive security
 * @dev Manages risk assessment, compliance rules, and automated decision making
 * @custom:security-contact security@face.network
 */
contract ComplianceEngine is 
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable
{
    // ============ Roles ============
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    // ============ Enums ============
    
    enum ComplianceStatus {
        PENDING,
        APPROVED,
        REJECTED,
        UNDER_REVIEW
    }
    
    // ============ Structs ============
    
    struct ComplianceRecord {
        address user;
        string assetType;
        uint256 amount;
        uint8 riskScore;
        ComplianceStatus status;
        uint256 timestamp;
        string txHash;
        bool fdcVerified;
        uint256 assetPrice;
        uint256 volatility;
        uint256 lastUpdated;
    }
    
    struct ComplianceHistory {
        ComplianceStatus status;
        uint256 timestamp;
        address updatedBy;
        string reason;
    }
    
    struct Statistics {
        uint256 totalChecks;
        uint256 totalApproved;
        uint256 totalRejected;
        uint256 totalUnderReview;
        uint256 totalRiskScore;
    }
    
    // ============ Constants ============
    
    uint8 public constant LOW_RISK_THRESHOLD = 30;
    uint8 public constant MEDIUM_RISK_THRESHOLD = 60;
    uint8 public constant HIGH_RISK_THRESHOLD = 85;
    uint8 public constant MAX_RISK_SCORE = 100;
    uint256 public constant MAX_BATCH_SIZE = 50;
    
    // ============ Storage ============
    
    mapping(uint256 => ComplianceRecord) private _complianceRecords;
    mapping(address => uint256[]) private _userRecords;
    mapping(uint256 => ComplianceHistory[]) private _recordHistory;
    
    uint256 private _recordCounter;
    Statistics private _stats;
    
    address public smartAccountFactory;
    address public fdcVerifier;
    address public ftsoPriceFeed;
    
    // ============ Custom Errors ============
    
    error Unauthorized();
    error InvalidRiskScore();
    error InvalidAssetType();
    error InvalidAmount();
    error InvalidAddress();
    error RecordNotFound();
    error InvalidStatus();
    error BatchSizeExceeded();
    error AlreadyProcessed();
    
    // ============ Events ============
    
    event ComplianceSubmitted(
        uint256 indexed recordId,
        address indexed user,
        string assetType,
        uint256 amount,
        uint8 riskScore,
        ComplianceStatus status
    );
    
    event ComplianceUpdated(
        uint256 indexed recordId,
        ComplianceStatus indexed newStatus,
        address indexed updatedBy,
        string reason
    );
    
    event ComplianceApproved(
        uint256 indexed recordId,
        address indexed user,
        uint256 timestamp
    );
    
    event ComplianceRejected(
        uint256 indexed recordId,
        address indexed user,
        uint8 riskScore,
        uint256 timestamp
    );
    
    event BatchComplianceSubmitted(
        uint256 indexed startId,
        uint256 indexed endId,
        address indexed user,
        uint256 count
    );
    
    event SmartAccountFactoryUpdated(address indexed oldFactory, address indexed newFactory);
    event FDCVerifierUpdated(address indexed oldVerifier, address indexed newVerifier);
    event FTSOPriceFeedUpdated(address indexed oldFeed, address indexed newFeed);
    
    // ============ Modifiers ============
    
    modifier validRiskScore(uint8 riskScore) {
        if (riskScore > MAX_RISK_SCORE) revert InvalidRiskScore();
        _;
    }
    
    modifier validAddress(address addr) {
        if (addr == address(0)) revert InvalidAddress();
        _;
    }
    
    modifier recordExists(uint256 recordId) {
        if (_complianceRecords[recordId].user == address(0)) revert RecordNotFound();
        _;
    }
    
    // ============ Initialization ============
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    function initialize(address admin) public initializer {
        __UUPSUpgradeable_init();
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _grantRole(OPERATOR_ROLE, admin);
        _grantRole(VERIFIER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        
        _recordCounter = 0;
    }
    
    // ============ Upgrade Authorization ============
    
    function _authorizeUpgrade(address newImplementation) 
        internal 
        override 
        onlyRole(ADMIN_ROLE) 
    {}
    
    // ============ Configuration Functions ============
    
    function setSmartAccountFactory(address _factory) 
        external 
        onlyRole(ADMIN_ROLE) 
        validAddress(_factory) 
    {
        address oldFactory = smartAccountFactory;
        smartAccountFactory = _factory;
        emit SmartAccountFactoryUpdated(oldFactory, _factory);
    }
    
    function setFDCVerifier(address _verifier) 
        external 
        onlyRole(ADMIN_ROLE) 
        validAddress(_verifier) 
    {
        address oldVerifier = fdcVerifier;
        fdcVerifier = _verifier;
        emit FDCVerifierUpdated(oldVerifier, _verifier);
    }
    
    function setFTSOPriceFeed(address _priceFeed) 
        external 
        onlyRole(ADMIN_ROLE) 
        validAddress(_priceFeed) 
    {
        address oldFeed = ftsoPriceFeed;
        ftsoPriceFeed = _priceFeed;
        emit FTSOPriceFeedUpdated(oldFeed, _priceFeed);
    }
    
    // ============ Core Functions ============
    
    function submitCompliance(
        string calldata assetType,
        uint256 amount,
        uint8 riskScore,
        string calldata txHash,
        bool fdcVerified,
        uint256 assetPrice,
        uint256 volatility
    ) 
        external 
        whenNotPaused 
        nonReentrant 
        onlyRole(OPERATOR_ROLE)
        validRiskScore(riskScore)
        returns (uint256) 
    {
        if (bytes(assetType).length == 0) revert InvalidAssetType();
        if (amount == 0) revert InvalidAmount();
        
        unchecked {
            ++_recordCounter;
        }
        uint256 recordId = _recordCounter;
        
        ComplianceStatus status = _determineStatus(riskScore, fdcVerified);
        
        _complianceRecords[recordId] = ComplianceRecord({
            user: msg.sender,
            assetType: assetType,
            amount: amount,
            riskScore: riskScore,
            status: status,
            timestamp: block.timestamp,
            txHash: txHash,
            fdcVerified: fdcVerified,
            assetPrice: assetPrice,
            volatility: volatility,
            lastUpdated: block.timestamp
        });
        
        _userRecords[msg.sender].push(recordId);
        
        // Update statistics
        unchecked {
            ++_stats.totalChecks;
            _stats.totalRiskScore += riskScore;
            
            if (status == ComplianceStatus.APPROVED) {
                ++_stats.totalApproved;
            } else if (status == ComplianceStatus.REJECTED) {
                ++_stats.totalRejected;
            } else if (status == ComplianceStatus.UNDER_REVIEW) {
                ++_stats.totalUnderReview;
            }
        }
        
        // Add to history
        _recordHistory[recordId].push(ComplianceHistory({
            status: status,
            timestamp: block.timestamp,
            updatedBy: msg.sender,
            reason: "Initial submission"
        }));
        
        emit ComplianceSubmitted(recordId, msg.sender, assetType, amount, riskScore, status);
        
        if (status == ComplianceStatus.APPROVED) {
            emit ComplianceApproved(recordId, msg.sender, block.timestamp);
        } else if (status == ComplianceStatus.REJECTED) {
            emit ComplianceRejected(recordId, msg.sender, riskScore, block.timestamp);
        }
        
        return recordId;
    }
    
    function batchSubmitCompliance(
        string[] calldata assetTypes,
        uint256[] calldata amounts,
        uint8[] calldata riskScores,
        string[] calldata txHashes,
        bool[] calldata fdcVerified,
        uint256[] calldata assetPrices,
        uint256[] calldata volatilities
    ) 
        external 
        whenNotPaused 
        nonReentrant 
        onlyRole(OPERATOR_ROLE)
        returns (uint256[] memory) 
    {
        uint256 length = assetTypes.length;
        if (length > MAX_BATCH_SIZE) revert BatchSizeExceeded();
        if (length != amounts.length || 
            length != riskScores.length || 
            length != txHashes.length ||
            length != fdcVerified.length ||
            length != assetPrices.length ||
            length != volatilities.length) revert InvalidAmount();
        
        uint256[] memory recordIds = new uint256[](length);
        uint256 startId = _recordCounter + 1;
        
        for (uint256 i = 0; i < length;) {
            recordIds[i] = submitCompliance(
                assetTypes[i],
                amounts[i],
                riskScores[i],
                txHashes[i],
                fdcVerified[i],
                assetPrices[i],
                volatilities[i]
            );
            
            unchecked { ++i; }
        }
        
        emit BatchComplianceSubmitted(startId, _recordCounter, msg.sender, length);
        
        return recordIds;
    }
    
    function approveCompliance(uint256 recordId, string calldata reason) 
        external 
        onlyRole(VERIFIER_ROLE) 
        recordExists(recordId)
    {
        ComplianceRecord storage record = _complianceRecords[recordId];
        if (record.status != ComplianceStatus.UNDER_REVIEW) revert InvalidStatus();
        
        record.status = ComplianceStatus.APPROVED;
        record.lastUpdated = block.timestamp;
        
        // Update stats
        unchecked {
            --_stats.totalUnderReview;
            ++_stats.totalApproved;
        }
        
        _recordHistory[recordId].push(ComplianceHistory({
            status: ComplianceStatus.APPROVED,
            timestamp: block.timestamp,
            updatedBy: msg.sender,
            reason: reason
        }));
        
        emit ComplianceUpdated(recordId, ComplianceStatus.APPROVED, msg.sender, reason);
        emit ComplianceApproved(recordId, record.user, block.timestamp);
    }
    
    function rejectCompliance(uint256 recordId, string calldata reason) 
        external 
        onlyRole(VERIFIER_ROLE) 
        recordExists(recordId)
    {
        ComplianceRecord storage record = _complianceRecords[recordId];
        if (record.status != ComplianceStatus.UNDER_REVIEW) revert InvalidStatus();
        
        record.status = ComplianceStatus.REJECTED;
        record.lastUpdated = block.timestamp;
        
        // Update stats
        unchecked {
            --_stats.totalUnderReview;
            ++_stats.totalRejected;
        }
        
        _recordHistory[recordId].push(ComplianceHistory({
            status: ComplianceStatus.REJECTED,
            timestamp: block.timestamp,
            updatedBy: msg.sender,
            reason: reason
        }));
        
        emit ComplianceUpdated(recordId, ComplianceStatus.REJECTED, msg.sender, reason);
        emit ComplianceRejected(recordId, record.user, record.riskScore, block.timestamp);
    }
    
    // ============ View Functions ============
    
    function getComplianceRecord(uint256 recordId) 
        external 
        view 
        recordExists(recordId)
        returns (ComplianceRecord memory) 
    {
        return _complianceRecords[recordId];
    }
    
    function batchGetComplianceRecords(uint256[] calldata recordIds) 
        external 
        view 
        returns (ComplianceRecord[] memory) 
    {
        uint256 length = recordIds.length;
        if (length > MAX_BATCH_SIZE) revert BatchSizeExceeded();
        
        ComplianceRecord[] memory records = new ComplianceRecord[](length);
        
        for (uint256 i = 0; i < length;) {
            if (_complianceRecords[recordIds[i]].user != address(0)) {
                records[i] = _complianceRecords[recordIds[i]];
            }
            unchecked { ++i; }
        }
        
        return records;
    }
    
    function getUserRecords(address user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return _userRecords[user];
    }
    
    function getRecordHistory(uint256 recordId) 
        external 
        view 
        recordExists(recordId)
        returns (ComplianceHistory[] memory) 
    {
        return _recordHistory[recordId];
    }
    
    function getStatistics() 
        external 
        view 
        returns (Statistics memory) 
    {
        return _stats;
    }
    
    function getTotalRecords() external view returns (uint256) {
        return _recordCounter;
    }
    
    function getAverageRiskScore() external view returns (uint256) {
        if (_stats.totalChecks == 0) return 0;
        return _stats.totalRiskScore / _stats.totalChecks;
    }
    
    function getApprovalRate() external view returns (uint256) {
        if (_stats.totalChecks == 0) return 0;
        return (_stats.totalApproved * 10000) / _stats.totalChecks; // Basis points
    }
    
    // ============ Internal Functions ============
    
    function _determineStatus(uint8 riskScore, bool fdcVerified) 
        internal 
        pure 
        returns (ComplianceStatus) 
    {
        if (!fdcVerified) {
            return ComplianceStatus.REJECTED;
        }
        
        if (riskScore < LOW_RISK_THRESHOLD) {
            return ComplianceStatus.APPROVED;
        }
        
        if (riskScore >= HIGH_RISK_THRESHOLD) {
            return ComplianceStatus.REJECTED;
        }
        
        return ComplianceStatus.UNDER_REVIEW;
    }
    
    // ============ Emergency Functions ============
    
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
}
