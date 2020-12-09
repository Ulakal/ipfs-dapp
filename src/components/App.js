import React, { Component } from 'react';
import './App.css';
import Web3 from 'web3';
import Meme from '../abis/Meme.json'

const ipfsClient = require('ipfs-http-client');
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' })

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  constructor(props) {
    super(props);
    this.state = {
      account: null,
      contract: null,
      buffer: null,
      memeHash: ''
    }
  }

  async loadWeb3() {
    if(window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    } 
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    const networkData = Meme.networks[networkId]
    
    if(networkData) {
      const contract = await web3.eth.Contract(Meme.abi, networkData.address)
      this.setState({ contract })
      const memeHash = await contract.methods.memeHash().call()
      this.setState({ memeHash })
    } else {
      window.alert("contract not deployed to detected network")
    }
  }

  captureFile = (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({buffer: Buffer(reader.result)})
      console.log("buffer: ", this.state.buffer)
    }
  };

  onSubmit = (event) => {
    event.preventDefault()
    
    ipfs.add(this.state.buffer, async (error, result) => {
      console.log("ipfs result: ", result)
      const memeHash = result[0].hash 
      await this.state.contract.methods.set(memeHash).send({from: this.state.account})
      .then((receipt) => {
        console.log(receipt)
        return this.setState({ memeHash })
      })
      
      if (error) {
        console.error(error)
        return
      }
    })
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
            Meme of the day
          </a>
          <ul className="navbar-nav px-3">
            <li className="nav-item nav-nowrap d-done d-sm-none d-sm-block">
              <small className="text-white">{this.state.account}</small>
            </li>
          </ul>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={`http://ipfs.infura.io/ipfs/${this.state.memeHash}`} />
                </a>
                
                <p>&nbsp;</p>
                <h2>Change meme</h2>
                <form onSubmit={this.onSubmit}>
                  <input type="file" onChange={this.captureFile} />
                  <input type="submit" />
                </form>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
