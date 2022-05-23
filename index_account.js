const Web3 = require('web3')
const { register_account, deployCkbProxyContact, get_benchmark_accounts_by_path } = require('./src/account_register.js');

(async () => {
	const ACCOUNT_PRIVATE_KEY = '0xdd50cac37ec6dd12539a968c1a2cbedda75bd8724f7bcad486548eaabb87fc8b'
	const rpc_url = 'http://localhost:8024'
	const TRANSFER_BALANCE = 1000000000000000000n
	const register_num = 1000
	const keystore_path = './keystore/account.private'

	const web3 = new Web3(new Web3.providers.HttpProvider(rpc_url))
	const old_account = web3.eth.accounts.wallet.add(ACCOUNT_PRIVATE_KEY)

	// deploy ckb proxy contract
	const ckbErc20Contract = await deployCkbProxyContact(web3, old_account)
	let benchmark_accounts = await get_benchmark_accounts_by_path(web3, keystore_path, register_num)
	let tokenBalance = await ckbErc20Contract.methods.balanceOf(old_account.address).call()
	console.log('old balance:', tokenBalance)

	for (let i = 0; i < benchmark_accounts.length; i++) {
		const account = web3.eth.accounts.wallet.add(benchmark_accounts[i])
		//register
		await register_account(rpc_url, ACCOUNT_PRIVATE_KEY, account.address)
		// transfer balance
		let tokenBalanceOnLayer2 = await ckbErc20Contract.methods.balanceOf(account.address).call()
		if (tokenBalanceOnLayer2 < TRANSFER_BALANCE) {
			await ckbErc20Contract.methods.transfer(account.address, TRANSFER_BALANCE).send(
				{
					from: old_account.address,
					gas: 6000000
				})
			tokenBalanceOnLayer2 = await ckbErc20Contract.methods.balanceOf(account.address).call()
		}
		console.log('account:', account.address, ' balanceOf:', tokenBalanceOnLayer2)
		if (tokenBalanceOnLayer2 < TRANSFER_BALANCE) {
			console.assert('check transfer failed')
		}
	}
	console.log('check accounts balance and register successful ')


})()
