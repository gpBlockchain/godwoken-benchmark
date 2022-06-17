const Web3 = require('web3')
const {
	register_account,
	deployCkbProxyContact,
	get_benchmark_accounts_by_path
} = require('./src/account_register.js');
(async () => {
	const ACCOUNT_PRIVATE_KEY = '0x1390c30e5d5867ee7246619173b5922d3b04009cab9e9d91e14506231281a997'
	const rpc_url = 'https://godwoken-alphanet-v1.ckbapp.dev'
	const TRANSFER_BALANCE = 100000000000000n
	const register_num = 3000
	const keystore_path = './keystore/account.private'

	const web3 = new Web3(new Web3.providers.HttpProvider(rpc_url))
	const old_account = web3.eth.accounts.wallet.add(ACCOUNT_PRIVATE_KEY)

	// deploy ckb proxy contract
	const ckbErc20Contract = await deployCkbProxyContact(web3, old_account)
	let benchmark_accounts = await get_benchmark_accounts_by_path(web3, keystore_path, register_num)
	let tokenBalance = await ckbErc20Contract.methods.balanceOf(old_account.address).call()
	console.log('old balance:', tokenBalance)

	for (let i = 0; i < benchmark_accounts.length; i++) {
		console.log('current :', i)
		const account = web3.eth.accounts.wallet.add(benchmark_accounts[i])
		await addLayer2Account(web3, rpc_url, ACCOUNT_PRIVATE_KEY, account.address, ckbErc20Contract, TRANSFER_BALANCE)
	}
	console.log('check accounts balance and register successful ')


})()


async function addLayer2Account(web3, rpc_url, account_private, register_address, ckbErc20Contract, provide_balance) {
	const account = web3.eth.accounts.wallet.add(account_private)
	await register_account(rpc_url, account_private, register_address)
	// transfer balance
	let tokenBalanceOnLayer2 = await ckbErc20Contract.methods.balanceOf(register_address).call()
	if (tokenBalanceOnLayer2 < provide_balance) {
		await ckbErc20Contract.methods.transfer(register_address, provide_balance).send(
			{
				from: account.address,
				gas: 6000000
			})
		tokenBalanceOnLayer2 = await ckbErc20Contract.methods.balanceOf(register_address).call()
	}
	console.log('account:', register_address, ' balanceOf:', tokenBalanceOnLayer2)
	if (tokenBalanceOnLayer2 < provide_balance) {
		console.assert('check transfer failed:',register_address)
	}
	return true
}
