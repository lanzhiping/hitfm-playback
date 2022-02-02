const getCurrentTab = async () => {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0] || tabs[0].url.startsWith('chrome://')) {
        resolve(null)
      }

      resolve(tabs[0].id)
    })
  })
}

const injectedFunction = () => {
  document.body.style.backgroundColor = 'wheat'
}

document.querySelector('#button').addEventListener('click', async () => {
  const tabId = await getCurrentTab()
  if (!tabId) return

  chrome.scripting.executeScript({
    target: { tabId },
    func: injectedFunction,
    args: []
  })
})
