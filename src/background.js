const updatePopup = (message) => {
  const [popup] = chrome.extension.getViews({
    type: "popup"
  })
  popup.document.getElementById('msg').innerHTML = message;
  popup.document.getElementById('animation-container').style.maxHeight = '0';
  popup.document.getElementById('animation').remove()
};

const messageListener = (message) =>
  updatePopup(message);
  
chrome.runtime.onMessage.addListener(messageListener);

const injectContentScript = (tab) => {
  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    files: ['content.js']
  });
};

const getCurrentTab = async () => {
  let queryOptions = { active: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}
  
getCurrentTab().then((tab)=>{
  injectContentScript(tab);
});