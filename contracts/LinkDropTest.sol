// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';

/**
 * @dev Elliptic Curve Digital Signature Algorithm (ECDSA) operations.
 *
 * These functions can be used to verify that a message was signed by the holder
 * of the private keys of a given address.
 */

contract LinkDropTest {
    using ECDSA for bytes32;

    // for creating a link
    struct Link {
        string campaignID;
        uint256 id;
        uint256 balance;
        address pubwallet;
        bool taken;
        uint256 time;
        bytes32 puzzle;
    }

    // checking whether the campaign is running
    bool public running;

    // might not need this
    uint256 public startTime;

    // duration of the campaign (by days)
    uint256 public duration;

    // might not need this
    uint256 public endTime;

    // storing client's address
    address payable public client;

    // storing validator's address
    address public validator;

    // storing campaign ID
    string public campaignID;

    // map to iterate links created
    mapping(uint256 => Link) public links;

    // counting the number of links (might not need this)
    uint256 public linkCount;

    // total amount of ERC20 stored to run the campaign (might not need this)
    uint256 public cost;

    // total amount of ERC20 stored to run the campaign (might not need this)
    uint256 public initialSupply;

    // number of links generated (might not need this)
    uint256 public num;

    // ERC20's airdrop amount per link (might not need this)
    uint256 public costPerNum;

    // address of the ERC20 token to be airdropped
    IERC20 public token;

    /**
     * @notice campaign deployment
     * @param _token ERC20 token address to be airdropped
     * @param _client client wallet address
     * @param _cost total amount of ERC20 to be airdropped from this campaign
     * @param _num number of links to be generated
     * @dev Reverts if one of the parameters are missing
     */
    constructor(
        address _token,
        address payable _client,
        uint256 _duration,
        uint256 _cost,
        uint256 _num,
        string memory _campaignID
    ) public {
        token = IERC20(_token);
        client = _client;
        cost = _cost;
        initialSupply = _cost;
        num = _num;
        costPerNum = _cost / _num;
        validator = msg.sender;
        campaignID = _campaignID;
        duration = _duration * 60 * 60 * 24;
        startTime = block.timestamp;
        endTime = startTime + duration;
        running = true;
    }

    /**
     * @notice checking whether the signed message is from the validator
     * @param nuu index number of the link map
     * @param signature signed message
     * @dev only validator can run this function
     */
    function isValidSignature(uint256 nuu, bytes calldata signature)
        public
        view
        onlyValidator
        returns (bool)
    {
        return
            links[nuu].puzzle.toEthSignedMessageHash().recover(signature) ==
            address(validator);
    }

    /**
     * @notice creating multiple links
     * @param nu number of links to be generated from this one transaction
     * @dev only validator can run this function
     */
    function createMultipleLinks(uint256 nu) public onlyValidator {
        for (uint256 i = 0; i < nu; i++) {
            addLink();
        }
    }

    /**
     * @notice creating a link
     * @dev only validator can run this function
     */
    function addLink() public onlyValidator {
        links[linkCount] = Link(
            campaignID,
            linkCount,
            costPerNum,
            address(0),
            false,
            0,
            keccak256(
                abi.encodePacked(
                    string.concat(
                        Strings.toString(linkCount),
                        Strings.toString(costPerNum),
                        campaignID
                    )
                )
            )
        );
        linkCount++;
        cost -= costPerNum;
    }

    /**
     * @notice fetching whole data of the links
     * @dev only client can run this function
     */
    function getLinks() public view onlyClient returns (Link[] memory) {
        Link[] memory id = new Link[](linkCount);
        for (uint256 i = 0; i < linkCount; i++) {
            Link storage link = links[i];
            id[i] = link;
        }
        return id;
    }

    /**
     * @notice might not need this but validator can check whether a certain indexed link has expired
     * @dev only validator can run this function
     */
    function getLinksFromValidator()
        public
        view
        onlyValidator
        returns (bool[] memory)
    {
        bool[] memory boolList = new bool[](linkCount);
        for (uint256 i = 0; i < linkCount; i++) {
            boolList[i] = links[i].taken;
        }
        return boolList;
    }

    /**
     * @notice might not need this but validator can check specific index has been used
     * @param nu index number
     * @dev only validator can run this function
     */
    function getLinksByIndexFromValidator(uint256 nu)
        public
        view
        onlyValidator
        returns (bool)
    {
        return links[nu].taken;
    }

    /**
     * @notice might not need this but client can pause the campaign
     * @dev only client can run this function
     */
    function pauseCampaign() public onlyClient {
        running = false;
    }

    /**
     * @notice might not need this but client can resume the campaign
     * @dev only client can run this function
     */
    function runCampaign() public onlyClient {
        running = true;
    }

    /**
     * @notice client can cancel the campaign and transfer the fund back to his wallet
     * @dev only client can run this function
     */
    function cancelCampaign() public onlyClient {
        uint256 amount = token.balanceOf(address(this));
        token.transfer(client, amount);
        running = false;
    }

    /**
     * @notice airdropping 
     * @param _id index number
     * @param _balance balance of the link
     * @param _user user that's getting the airdrop
     * @dev only validator can run this function
     */
    function airdrop(
        uint256 _id,
        uint256 _balance,
        address _user,
        bytes calldata _signature
    ) public onlyValidator {
        require(endTime > block.timestamp, 'timestamp exceeds expiration date');
        require(links[_id].taken == false);
        require(links[_id].balance == _balance);
        require(running == true);
        require(isValidSignature(_id, _signature) == true);
        token.transfer(_user, links[_id].balance);
        links[_id].taken = true;
        links[_id].balance = 0;
        links[_id].pubwallet = _user;
    }

    /**
     * @notice funding the contract
     * @param _fundingAmount amount that will be stored in the campaign contract
     * @dev only client can run this function
     */
    function fundContract(uint256 _fundingAmount) external onlyClient {
        token.transferFrom(msg.sender, address(this), _fundingAmount);
    }

    modifier onlyValidator() {
        require(msg.sender == validator, 'not validator');
        _;
    }

    modifier onlyClient() {
        require(msg.sender == client, 'not client');
        _;
    }
}
