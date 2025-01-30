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

// Function to connect wallet
async function connectWallet() {
    console.log('Connect Wallet button clicked'); // Debugging

    if (typeof window.ethereum === 'undefined') {
        console.error('MetaMask is not installed'); // Debugging
        alert('MetaMask is not installed. Please install MetaMask to use this app.');
        return;
    }

    try {
        console.log('Requesting accounts...'); // Debugging
        web3 = new Web3(window.ethereum);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }); // Request wallet access
        console.log('Accounts:', accounts); // Debugging

        if (accounts.length === 0) {
            alert('No accounts found. Please connect an account in MetaMask.');
            return;
        }

        userAccount = accounts[0];

        // Initialize contract
        contract = new web3.eth.Contract(abi, contractAddress);
        console.log('Contract initialized:', contract); // Debugging

        // Update UI to show connected wallet
        document.getElementById('walletStatus').textContent = `Connected: ${userAccount}`;
        document.getElementById('connectButton').style.display = 'none';
        document.getElementById('disconnectButton').style.display = 'inline-block';
        document.getElementById('taskControls').style.display = 'block'; // Show task controls

        console.log('Connected Account:', userAccount); // Debugging
    } catch (error) {
        console.error('User denied account access or error occurred:', error); // Debugging
        alert('Failed to connect wallet. Please try again.');
    }
}

// Function to disconnect wallet
function disconnectWallet() {
    userAccount = null;
    web3 = null;
    contract = null;

    // Update UI to show disconnected wallet
    document.getElementById('walletStatus').textContent = 'Not Connected';
    document.getElementById('connectButton').style.display = 'inline-block';
    document.getElementById('disconnectButton').style.display = 'none';
    document.getElementById('taskControls').style.display = 'none'; // Hide task controls

    console.log('Wallet disconnected.');
}

// Function to add a task
async function addTask() {
    if (!userAccount) {
        alert('Please connect your wallet first.');
        return;
    }

    const taskTitle = document.getElementById('taskTitle').value;
    const taskText = document.getElementById('taskText').value;
    const isDeleted = document.getElementById('isDeleted').checked;

    console.log('Adding task:', { taskTitle, taskText, isDeleted }); // Debugging

    try {
        const result = await contract.methods.addTask(taskText, taskTitle, isDeleted).send({ from: userAccount });
        console.log('Task added successfully:', result); // Debugging
        alert('Task added successfully!');
    } catch (error) {
        console.error('Error adding task:', error); // Debugging
        alert('Failed to add task. Please try again.');
    }
}

// Function to get tasks
async function getTasks() {
    if (!userAccount) {
        alert('Please connect your wallet first.');
        return;
    }

    try {
        const tasks = await contract.methods.getMyTask().call({ from: userAccount });
        console.log('Tasks fetched:', tasks); // Debugging

        const taskList = document.getElementById('taskList');
        taskList.innerHTML = ''; // Clear current task list

        tasks.forEach(task => {
            const li = document.createElement('li');
            li.textContent = `Task ID: ${task.id} - ${task.taskTitle}: ${task.taskText} [Deleted: ${task.isDeleted}]`;

            // Add a delete button for each task
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = () => deleteTask(task.id);

            li.appendChild(deleteButton);
            taskList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching tasks:', error); // Debugging
        alert('Failed to fetch tasks. Please try again.');
    }
}

// Function to delete a task
async function deleteTask(taskId) {
    if (!userAccount) {
        alert('Please connect your wallet first.');
        return;
    }

    try {
        await contract.methods.deleteTask(taskId).send({ from: userAccount });
        alert('Task deleted successfully!');
        getTasks(); // Refresh the task list
    } catch (error) {
        console.error('Error deleting task:', error); // Debugging
        alert('Failed to delete task. Please try again.');
    }
}

// Event Listeners
document.getElementById('connectButton').addEventListener('click', connectWallet);
document.getElementById('disconnectButton').addEventListener('click', disconnectWallet);
document.getElementById('addTaskButton').addEventListener('click', addTask);
document.getElementById('getTasksButton').addEventListener('click', getTasks);

// Initialize UI
function initializeUI() {
    document.getElementById('walletStatus').textContent = 'Not Connected';
    document.getElementById('disconnectButton').style.display = 'none';
    document.getElementById('taskControls').style.display = 'none'; // Hide task controls initially
}

// Initialize UI on page load
initializeUI();