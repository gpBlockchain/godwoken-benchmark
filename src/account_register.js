const Web3 = require('web3')
const { WaitableBatchRequest } = require('./utils')
const logger = require('./logger')
const { GodwokenClient } = require('./godwoken')
const { NodeInfo, getAccountIdByEthAddress, createEoaAccount, setMapping } = require('./registerV1')
const { promises: fs } = require('fs')
const ProxyBINPath = './contracts/SudtERC20Proxy.bin'


async function deployCkbProxyContact(web3, account) {
	const SudtProxyBytecode = (await (await fs.readFile(ProxyBINPath)).toString())
	const deployTx = new web3.eth.Contract(CompiledContractArtifact.abi).deploy({
		data: SudtProxyBytecode,
		arguments: ['CKB', 'CKB', 9999999999, '1', 18]
	}).send({
		from: account.address,
		gas: 6000000
	})
	deployTx.on('transactionHash', hash => console.log(`deploy proxy CKB contract success , Transaction hash: ${hash}`))
	return deployTx
}


async function register_account(rpcUrl, privateKey, ethAddr) {
	let rpc = new GodwokenClient(rpcUrl)
	const res = await rpc.getNodeInfo()
	const nodeInfo = new NodeInfo(res)
	const accountId = await getAccountIdByEthAddress(rpc, nodeInfo, ethAddr)
	if (accountId != null) {
		console.log('already register,account Id:', accountId)
		return
	}
	await createEoaAccount(rpc, privateKey, ethAddr, nodeInfo)
	await setMapping(rpc, privateKey, ethAddr, nodeInfo)
}

async function get_benchmark_accounts_by_path(web3, path, num) {
	const private_array = ((await fs.readFile(path)).toString().split('\n'))
	let accounts = []
	if (private_array.length > num) {
		return private_array.slice(0, num)
	}
	for (let i = 0; i < private_array.length; i++) {
		if (private_array.length === 66) {
			accounts.push(private_array[i])
		}
	}
	for (let i = accounts.length; i < num; i++) {
		let benchmark_account = web3.eth.accounts.create()
		await fs.appendFile(path, benchmark_account.privateKey + '\n')
		accounts.push(benchmark_account.privateKey)
	}
	return accounts
}


module.exports = {
	deployCkbProxyContact,
	register_account,
	get_benchmark_accounts_by_path
}

