const path = require('path');           // used for independent platform compatibility
const fs = require('fs-extra');               // file system
const solc = require('solc')            // solidity compiler

const lotteryPath = path.resolve(__dirname, 'contracts', 'lottery.sol');

const source = fs.readFileSync(lotteryPath, 'utf8');

var input = {
    language: 'Solidity',
    sources: {
        'Lottery.sol' : {
            content: source
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': [ '*' ]
            }
        }
    }
};

var output = JSON.parse(solc.compile(JSON.stringify(input)));

// console.log(output.contracts['Lottery.sol']['Lottery'].abi)
// console.log(output.contracts['Lottery.sol']['Lottery'].evm.bytecode.object);

exports.abi = output.contracts['Lottery.sol']['Lottery'].abi;
exports.bytecode = output.contracts['Lottery.sol']['Lottery'].evm.bytecode.object;
