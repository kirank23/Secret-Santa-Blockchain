App = {
  loading: false,
  contracts: {},

  load: async () => {
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
    await App.render()
  },

  // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
  loadWeb3: async () => {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      window.alert("Please connect to Metamask.")
    }
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {
        // Request account access if needed
        await ethereum.enable()
        // Acccounts now exposed
        web3.eth.sendTransaction({/* ... */})
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
      // Acccounts always exposed
      web3.eth.sendTransaction({/* ... */})
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  },

  loadAccount: async () => {
    // Set the current blockchain account
    App.account = web3.eth.accounts[0]
  },

  loadContract: async () => {
    // Create a JavaScript version of the smart contract
    const wishList = await $.getJSON('WishList.json')
    App.contracts.WishList = TruffleContract(wishList)
    App.contracts.WishList.setProvider(App.web3Provider)

    // Hydrate the smart contract with values from the blockchain
    App.wishList = await App.contracts.WishList.deployed()
  },

  render: async () => {
    // Prevent double render
    if (App.loading) {
      return
    }

    // Update app loading state
    App.setLoading(true)

    // Render Account
    $('#account').html(App.account)

    // Render Gifts
    await App.renderGifts()

    // Update loading state
    App.setLoading(false)
  },

  renderGifts: async () => {
    // Load the total gift count from the blockchain
    const giftCount = await App.wishList.giftCount()
    const $giftTemplate = $('.giftTemplate')

    // Render out each gift with a new gift template
    for (var i = 1; i <= giftCount; i++) {
      // Fetch the gift data from the blockchain
      const gift = await App.wishList.gifts(i)
      const giftId = gift[0].toNumber()
      const giftContent = gift[1]
      const giftReceived = gift[2]

      // Create the html for the gift
      const $newGiftTemplate = $giftTemplate.clone()
      $newGiftTemplate.find('.content').html(giftContent)
      $newGiftTemplate.find('input')
                      .prop('name', giftId)
                      .prop('checked', giftReceived)
                      .on('click', App.toggleReceived)

      // Put the gift in the correct list
      if (giftReceived) {
        $('#receivedGiftList').append($newGiftTemplate)
      } else {
        $('#giftList').append($newGiftTemplate)
      }

      // Show the gift
      $newGiftTemplate.show()
    }
  },

  createGift: async () => {
    App.setLoading(true)
    const content = $('#newGift').val()
    await App.wishList.createGift(content)
    window.location.reload()
  },

  toggleReceived: async (e) => {
    App.setLoading(true)
    const giftId = e.target.name
    await App.wishList.toggleReceived(giftId)
    window.location.reload()
  },

  setLoading: (boolean) => {
    App.loading = boolean
    const loader = $('#loader')
    const content = $('#content')
    if (boolean) {
      loader.show()
      content.hide()
    } else {
      loader.hide()
      content.show()
    }
  }
}

$(() => {
  $(window).load(() => {
    App.load()
  })
})