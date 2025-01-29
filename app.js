// Define the Web3 instance and contract ABI
let web3;
let contract;
let userAccount;

const contractAddress = '0xa0FCf6e869610cBc7d554D9D6550aBd197e577b8'; // Replace with the deployed contract address
const abi = [
    {
        "inputs": [
            { "internalType": "string", "name": "taskText", "type": "string" },
            { "internalType": "string", "name": "taskTitle", "type": "string" },
            { "internalType": "bool", "name": "isDeleted", "type": "bool" }
        ],
        "name": "addTask",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": false, "internalType": "address", "name": "recipient", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "taskId", "type": "uint256" }
        ],
        "name": "AddTask",
        "type": "event"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "taskId", "type": "uint256" }
        ],
        "name": "deleteTask",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": false, "internalType": "uint256", "name": "taskId", "type": "uint256" },
            { "indexed": false, "internalType": "bool", "name": "isDeleted", "type": "bool" }
        ],
        "name": "DeleteTask",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "getMyTask",
        "outputs": [
            {
                "components": [
                    { "internalType": "uint256", "name": "id", "type": "uint256" },
                    { "internalType": "string", "name": "taskTitle", "type": "string" },
                    { "internalType": "string", "name": "taskText", "type": "string" },
                    { "internalType": "bool", "name": "isDeleted", "type": "bool" }
                ],
                "internalType": "struct TaskContract.Task[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

async function init() {
    // Check if MetaMask is installed
    if (typeof window.ethereum !== 'undefined') {
        web3 = new Web3(window.ethereum);
        await window.ethereum.enable(); // Request wallet access

        const accounts = await web3.eth.getAccounts();
        userAccount = accounts[0];

        // Initialize contract
        contract = new web3.eth.Contract(abi, contractAddress);

        // Display user account
        console.log('Connected Account:', userAccount);
    } else {
        alert('MetaMask is required!');
    }
}

async function addTask() {
    const taskTitle = document.getElementById('taskTitle').value;
    const taskText = document.getElementById('taskText').value;
    const isDeleted = document.getElementById('isDeleted').checked;

    await contract.methods.addTask(taskText, taskTitle, isDeleted).send({ from: userAccount });
    alert('Task added successfully!');
}

async function getTasks() {
    const tasks = await contract.methods.getMyTask().call({ from: userAccount });
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = ''; // Clear current task list

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.textContent = `Task: ${task.taskTitle} - ${task.taskText} [Deleted: ${task.isDeleted}]`;
        taskList.appendChild(li);
    });
}

// Event Listeners
document.getElementById('addTaskButton').addEventListener('click', addTask);
document.getElementById('getTasksButton').addEventListener('click', getTasks);

// Initialize Web3 and contract
init();
