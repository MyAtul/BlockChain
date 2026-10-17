
 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract SupplyChain {
    address public immutable admin;
    uint256 private nextProductId = 1;

    struct Participant {
        string name;
        string role;
        bool registered;
    }

    struct Product {
        uint256 id;
        string name;
        string description;
        string origin;
        address currentOwner;
        string status;
        bool exists;
    }

    struct History {
        address updatedBy;
        string location;
        string status;
        string notes;
        uint256 timestamp;
    }

    mapping(address => Participant) public participants;
    mapping(uint256 => Product) private products;
    mapping(uint256 => History[]) private productHistory;

    event ParticipantRegistered(
        address indexed account,
        string name,
        string role
    );

    event ProductRegistered(
        uint256 indexed productId,
        string name,
        address indexed owner
    );

    event ProductUpdated(
        uint256 indexed productId,
        string location,
        string status,
        address indexed updatedBy
    );

    event OwnershipTransferred(
        uint256 indexed productId,
        address indexed previousOwner,
        address indexed newOwner
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyParticipant() {
        require(
            participants[msg.sender].registered,
            "Not a registered participant"
        );
        _;
    }

    modifier productExists(uint256 productId) {
        require(products[productId].exists, "Product does not exist");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function registerParticipant(
        address account,
        string calldata name,
        string calldata role
    ) external onlyAdmin {
        require(account != address(0), "Invalid participant address");
        require(bytes(name).length > 0, "Name is required");
        require(bytes(role).length > 0, "Role is required");
        require(
            !participants[account].registered,
            "Participant already registered"
        );

        participants[account] = Participant({
            name: name,
            role: role,
            registered: true
        });

        emit ParticipantRegistered(account, name, role);
    }

    function registerProduct(
        string calldata name,
        string calldata description,
        string calldata origin
    ) external onlyParticipant returns (uint256) {
        require(bytes(name).length > 0, "Product name is required");
        require(bytes(origin).length > 0, "Origin is required");

        uint256 productId = nextProductId++;

        products[productId] = Product({
            id: productId,
            name: name,
            description: description,
            origin: origin,
            currentOwner: msg.sender,
            status: "Registered",
            exists: true
        });

        productHistory[productId].push(
            History({
                updatedBy: msg.sender,
                location: origin,
                status: "Registered",
                notes: "Product created",
                timestamp: block.timestamp
            })
        );

        emit ProductRegistered(productId, name, msg.sender);

        return productId;
    }

    function updateProduct(
        uint256 productId,
        string calldata location,
        string calldata status,
        string calldata notes
    ) external onlyParticipant productExists(productId) {
        Product storage product = products[productId];

        require(
            product.currentOwner == msg.sender,
            "Only current owner can update product"
        );
        require(bytes(location).length > 0, "Location is required");
        require(bytes(status).length > 0, "Status is required");

        product.status = status;

        productHistory[productId].push(
            History({
                updatedBy: msg.sender,
                location: location,
                status: status,
                notes: notes,
                timestamp: block.timestamp
            })
        );

        emit ProductUpdated(productId, location, status, msg.sender);
    }

    function transferProduct(
        uint256 productId,
        address newOwner,
        string calldata location,
        string calldata notes
    ) external onlyParticipant productExists(productId) {
        Product storage product = products[productId];

        require(
            product.currentOwner == msg.sender,
            "Only current owner can transfer product"
        );
        require(newOwner != address(0), "Invalid recipient address");
        require(newOwner != msg.sender, "Cannot transfer to yourself");
        require(
            participants[newOwner].registered,
            "Recipient is not registered"
        );
        require(bytes(location).length > 0, "Location is required");

        address previousOwner = product.currentOwner;
        product.currentOwner = newOwner;
        product.status = "Transferred";

        productHistory[productId].push(
            History({
                updatedBy: msg.sender,
                location: location,
                status: "Transferred",
                notes: notes,
                timestamp: block.timestamp
            })
        );

        emit OwnershipTransferred(productId, previousOwner, newOwner);
    }

    function getProduct(
        uint256 productId
    ) external view productExists(productId) returns (
        uint256 id,
        string memory name,
        string memory description,
        string memory origin,
        address currentOwner,
        string memory status
    ) {
        Product storage product = products[productId];

        return (
            product.id,
            product.name,
            product.description,
            product.origin,
            product.currentOwner,
            product.status
        );
    }

    function getHistory(
        uint256 productId
    ) external view productExists(productId) returns (
        History[] memory
    ) {
        return productHistory[productId];
    }

    function getHistoryCount(
        uint256 productId
    ) external view productExists(productId) returns (uint256) {
        return productHistory[productId].length;
    }
}
