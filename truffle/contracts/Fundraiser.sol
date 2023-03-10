pragma solidity ^0.8.14;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Fundraiser is Ownable {

    event DonationReceived(address indexed donor, uint256 value);
    event Withdraw(uint256 amount);

    using SafeMath for uint256;

    uint256 public totalDonations;
    uint256 public donationsCount;

    struct Donation {
        uint256 value;
        uint256 date;
    }
    mapping(address => Donation[]) private _donations; // 暗黙的に Donation のストレージ配列が宣言される

    /**
     * public な状態変数を定義すると、自動的に以下の getter 関数が定義される
     * function name() external view returns(string memory) {
     *     return _name;
     * }
     */
    string public name;
    string public url;
    string public imageURL;
    string public description;
    address payable public beneficiary;

    constructor(
        string memory _name,
        string memory _url,
        string memory _imageURL,
        string memory _description,
        address payable _beneficiary,
        address _custodian
    ) {
        name = _name;
        url = _url;
        imageURL = _imageURL;
        description = _description;
        beneficiary = _beneficiary;
        transferOwnership(_custodian);
    }

    function setBeneficiary(address payable _beneficiary) public onlyOwner {
        beneficiary = _beneficiary;
    }

    function myDonationsCount() public view returns(uint256) {
        return _donations[msg.sender].length;
    }

    function donate() public payable {
        Donation memory donation = Donation({
            value: msg.value,
            date: block.timestamp
        });
        _donations[msg.sender].push(donation); // push はストレージ配列のみに利用可能
        totalDonations = totalDonations.add(msg.value);
        donationsCount++;

        emit DonationReceived(msg.sender, msg.value);
    }

    function myDonations() public view returns(
        uint256[] memory values,
        uint256[] memory dates
    )
    {
        uint256 count = myDonationsCount();
        values = new uint256[](count);
        dates = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            Donation storage donation = _donations[msg.sender][i];
            values[i] = donation.value;
            dates[i] = donation.date;
        }

        return (values, dates);
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        beneficiary.transfer(balance);

        emit Withdraw(balance);
    }

    // フォールバック関数
    receive() external payable {
        totalDonations = totalDonations.add(msg.value);
        donationsCount++;
    }
}
