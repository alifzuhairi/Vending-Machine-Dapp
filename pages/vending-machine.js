import style from '../styles/VendingMachine.module.css'
import Web3 from 'web3'
import { useState, useEffect  } from 'react'
import VendingMachineContract from '../blockchain/vending.js'
import 'bulma/css/bulma.css'
import Head from 'next/head'


const VendingMachine = () => {
    
    const [error, setError] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [inventory, setInventory] = useState('')
    const [myDonutCount, setMyDonutCount] = useState('')
    const [buyCount, setBuyCount] = useState('')
    const [web3, setWeb3] = useState(null)
    const [Address, setAddress] = useState(null)
    const [vmContract, setVmContract] = useState(null)

    useEffect(() => {
        if (vmContract) getInventoryHandler()
        if (vmContract && Address) getMyDonutCountHandler()
    }, [vmContract, Address])

    const getInventoryHandler = async () =>  {
        const inventory = await vmContract.methods.getVendingMachineBalance().call()
        setInventory(inventory)
    }

    const getMyDonutCountHandler = async () => {
        const count = await vmContract.methods.donutBalances(Address).call()
        setMyDonutCount(count)
    }

    const updateDonutQty = event => {
        setBuyCount(event.target.value)

    }

    const buyDonutHandler = async () => {
        try {
            await vmContract.methods.purchase(buyCount).send({
                from: Address,
                value: web3.utils.toWei('2','ether') * buyCount
            })
            setSuccessMsg(`$(buyCount) Donuts Purchased`)


        if (vmContract) getInventoryHandler()
        if (vmContract && Address) getMyDonutCountHandler()
        } catch(err) {
            setError(err.message)
        }
    }
    

    //window.ethereum
    const connectWalletHandler = async () => {
        if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
            try {
            await window.ethereum.request({ method:"eth_requestAccounts"})
            web3 = new Web3 (window.ethereum)
            setWeb3(web3)
            const accounts = await web3.eth.getAccounts()
            setAddress(accounts[0])
            const vm = VendingMachineContract(web3)
            setVmContract(vm)
            } catch(err) {
                setError(err.message)
            }
        } else
        console.log('Please install Metamask')
    }

    return (
    <div className={style.main}>
       <Head>
        <title>Donut Vending Machine Dapp</title>
        <meta name="description" content="Simple Dapp" />
        <link rel="icon" href="/favicon.ico" />
       </Head>
       <nav className='navbar mt-4 mb-4'>
           <div className='container'>
               <div className='navbar-brand'>
                   <h1>Donut Vending Machine</h1>
               </div>
               <div className='navbar-end'>
                   <button onClick={connectWalletHandler} className='button is-primary'>Connect Wallet</button>
               </div>
           </div>
       </nav>
       <section>
           <div className='container'>
               <h2>Total Supply : {inventory}</h2>
           </div>
       </section>
       <section>
           <div className='container'>
               <h2>My Donut : {myDonutCount}</h2>
           </div>
       </section>
       <section className='mt-5 '>
           <div className='container'>
               <div className='field'>
                   <label className='label'>Buy Donut: </label>
                   <div className='control'>
                       <input onChange={updateDonutQty} className='input is-rounded' type='type' placeholder='Enter amount...'/>
                   </div>
                   <button 
                   onClick={buyDonutHandler} 
                   className='button is-primary mt-2'>Buy</button>
               </div>
           </div>
       </section>
       <section>
           <div className='container has-text-danger'>
               <p>{error}</p>
           </div>
       </section>
       <section>
           <div className='container has-text-success'>
               <p>{successMsg}</p>
           </div>
       </section> 
    </div>
    )


}

export default VendingMachine