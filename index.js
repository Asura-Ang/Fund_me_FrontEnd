import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"
// Remeber to put .js
// If you shut off your node then reset your account in metamask
// if you get error stating that nonce is different then reset you account as you may have removed the node
/**
 * Notes :
 * Heading
 *
 */

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        console.log("I see a MetaMask, Let's Connect")
        await ethereum.request({ method: "eth_requestAccounts" })
        connectButton.innerHTML = "Connected"
    } else {
        connectButton.innerHTML = "Please Install MetaMask"
    }
}
async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        try {
            const balance = await provider.getBalance(contractAddress)
            console.log(ethers.utils.formatEther(balance))
        } catch (error) {
            console.log(error)
        }
    } else {
        balanceButton.innerHTML = "Please install MetaMask"
    }
}

async function withdraw() {
    console.log("Withdrawing....")
    const provider = new ethers.providers.Web3Provider(window.ethereum) // This provides HTTP end point from our Metamask wallet to the website to make transactions
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
        const contractResponse = await contract.withdraw()
        await listenForTransactionMine(contractResponse, provider)
    } catch (error) {
        console.log(error)
    }
}
async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}`)
    if (typeof window.ethereum !== "undefined") {
        // Provider / connection to the blockchain
        // signer / wallet / someone with some gas
        // contract that we are interacting with
        // ABI & Address
        const provider = new ethers.providers.Web3Provider(window.ethereum) // This provides HTTP end point from our Metamask wallet to the website to make transactions
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done!!!")
        } catch (error) {
            console.log(error)
        }
    }
}
// Basically what we are doing here is that provider.once uses transactionResponse.hash as a event to listen and the call a listner
function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            )
            resolve()
        })
    })
}
