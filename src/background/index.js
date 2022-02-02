chrome.runtime.onInstalled.addListener(() => {
  chrome.action.disable()

  // Clear all rules to ensure only our expected rules are set
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    // Declare a rule to enable the action on example.com pages
    let rule = {
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { schemes: ['https'] }
        })
      ],
      actions: [new chrome.declarativeContent.ShowAction()]
    }

    // Finally, apply our new array of rules
    chrome.declarativeContent.onPageChanged.addRules([rule])
  })
})
